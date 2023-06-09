<template>
  <v-container v-if="!canceled && connectionState === 'connecting'">
    <v-row>
      <v-col>
        <v-progress-circular indeterminate color="secondary" :size="200" :width="2" style="margin-top: 3rem;">
          Connecting...
        </v-progress-circular>

        <v-textarea label="server-host command" v-model="serverHostCommand" variant="outlined" rows="2" class="text-grey" style="margin-top: 5rem;">
          <template v-slot:append-inner>
            <CopyToClipboardButton :text="serverHostCommand"/>
          </template>
        </v-textarea>
      </v-col>
    </v-row>
  </v-container>
  <div ref="terminal" v-show="connectionState === 'connected'" style="width: 100%; height: calc(100% - 15px);"></div>

  <v-snackbar v-model="showsSnackbar" location="top" :timeout="2500">
    <v-icon v-if="snackbarIcon !== undefined" :icon="snackbarIcon"></v-icon>
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import 'xterm/css/xterm.css';
import urlJoin from "url-join";
import * as Comlink from 'comlink';
import {mdiCheck, mdiKey, mdiCancel} from "@mdi/js";
import {FitAddon} from 'xterm-addon-fit';
import type {AuthKeySetForSsh} from "@/go-wasm-exported-promise";
import {ServerHostKeyManager} from "@/ServerHostKeyManager";
import {AuthKeySet, storedAuthKeySets} from "@/authKeySets";
import {aliveGoWasmWorkerRemotePromise, getAuthPublicKeyType, sshPrivateKeyIsEncrypted} from "@/go-wasm-using-worker";
import {fragmentParams} from "@/fragment-params";
import CopyToClipboardButton from "@/components/CopyToClipboardButton.vue";
import {getServerHostCommand} from "@/getServerHostCommand";
import {showPrompt} from "@/components/DialogsForGlobal/store";

const props = defineProps<{
  pipingServerUrl: string,
  csPath: string,
  scPath: string,
  username: string,
}>();

const emit = defineEmits<{
  (event: 'end'): void
}>();

const xtermPromise = () => import("xterm");

const connectionState = ref<"connecting" | "connected">("connecting");

const terminal = ref<HTMLDivElement>();
const serverHostKeyManager = new ServerHostKeyManager();
const showsSnackbar = ref(false);
const snackbarIcon = ref<string>();
const snackbarMessage = ref<string>();

watch(showsSnackbar, () => {
  if (showsSnackbar.value) {
    return;
  }
  snackbarIcon.value = undefined;
  snackbarMessage.value = undefined;
});

const canceled = ref(false);

const serverHostCommand = ref(getServerHostCommand({
  pipingServerUrl: props.pipingServerUrl,
  csPath: props.csPath,
  scPath: props.scPath,
  sshServerPort: fragmentParams.sshServerPortForHint() ?? 22,
}));

async function getAuthKeySetsForSsh(): Promise<AuthKeySetForSsh[]> {
  const notSorted = await Promise.all(storedAuthKeySets.value
    .filter(s => s.enabled)
    .map(async s => {
      const encrypted = await sshPrivateKeyIsEncrypted(s.privateKey);
      const set: AuthKeySetForSsh = {
        publicKey: s.publicKey,
        privateKey: s.privateKey,
        encrypted,
      };
      return set;
    })
  );
  return [
    // key with passphrase first for better user experience
    ...notSorted.filter(a => !a.encrypted),
    ...notSorted.filter(a => a.encrypted),
  ];
}

function findAuthKeySetByFingerprint(sha256Fingerprint: string): AuthKeySet | undefined {
  return storedAuthKeySets.value.find(s => s.sha256Fingerprint === sha256Fingerprint);
}

async function getAuthPrivateKeyPassphrase(sha256Fingerprint: string): Promise<string> {
  const authKeySetForSsh: AuthKeySet = findAuthKeySetByFingerprint(sha256Fingerprint)!;
  const keyType = await getAuthPublicKeyType(authKeySetForSsh.publicKey);
  const passphrase: string | undefined = await showPrompt({
    title: "Passphrase",
    message: `(${authKeySetForSsh.name}) ${keyType}\nEnter passphrase for key`,
    inputType: "password",
    width: "60vw",
  });
  if (passphrase === undefined) {
    canceled.value = true;
    throw new Error("passphrase input canceled");
  }
  return passphrase;
}

onMounted(async () => {
  await start();
});

async function start() {
  const {Terminal} = await xtermPromise();
  const term = new Terminal({ cursorBlink: true });
  const fitAddon = new FitAddon();
  const termResizeMessageChannel = new MessageChannel();
  term.loadAddon(fitAddon);
  term.open(terminal.value!);
  window.addEventListener('resize', () => {
    fitTerminal();
  });

  async function fitTerminal() {
    const proposedDims = fitAddon.proposeDimensions();
    if (proposedDims === undefined) {
      return;
    }
    termResizeMessageChannel.port1.postMessage({
      cols: proposedDims.cols,
      rows: proposedDims.rows,
    });
    fitAddon.fit();
  }

  const {readable: sendReadable, writable: sendWritable} = new TransformStream();
  const csUrl = urlJoin(props.pipingServerUrl, props.csPath);
  const scUrl = urlJoin(props.pipingServerUrl, props.scPath);
  const pipingServerHeaders = new Headers(fragmentParams.pipingServerHeaders() ?? []);
  // TODO: retry connection
  fetch(csUrl, {
    method: "POST",
    headers: pipingServerHeaders,
    body: sendReadable,
    duplex: 'half',
  } as any).then(postRes => {
    console.log("postRes", postRes);
  });
  const getRes = await fetch(scUrl, {
    headers: pipingServerHeaders,
  });
  // TODO: status check
  const transport = {
    readable: getRes.body!,
    writable: sendWritable,
  };
  const originalTermWrite = term.write;
  // For fitting terminal
  term.write = (...args: any) => {
    originalTermWrite.apply(term, args);
    // Restore original .write()
    term.write = originalTermWrite;
    term.focus();
    // FIXME: fitting several times solves the fitting problem in the first session
    fitTerminal();
    fitTerminal();
    fitTerminal();
    fitTerminal();
  };
  const termReadable = new ReadableStream<string>({
    start(ctrl) {
      // NOTE: listener registration in Worker using Comlink does not work
      term.onData((data: string) => {
        ctrl.enqueue(data);
      });
    },
  });
  try {
    let passwordTried = false;
    const transfers: Transferable[] = [
      transport.readable,
      transport.writable,
      termReadable,
      termResizeMessageChannel.port2
    ];
    await (await aliveGoWasmWorkerRemotePromise()).doSsh(Comlink.transfer({
      transport,
      termReadable,
      initialRows: term.rows,
      initialCols: term.cols,
      username: props.username,
      termResizeMessagePort: termResizeMessageChannel.port2,
      authKeySets: await getAuthKeySetsForSsh(),
    }, transfers), Comlink.proxy({
      termWrite(data: Uint8Array) {
        term.write(data);
      },
      async onPasswordAuth(): Promise<string> {
        const passwordInFragment = fragmentParams.sshPassword();
        if (!passwordTried && passwordInFragment !== undefined) {
          return passwordInFragment
        }
        const message = passwordTried ? "try again." : "";
        const password: string | undefined = await showPrompt({
          title: "Password",
          message,
          inputType: "password",
          width: "60vw",
        });
        if (password === undefined) {
          canceled.value = true;
          throw new Error("user aborted password input");
        }
        passwordTried = true;
        return password;
      },
      getAuthPrivateKeyPassphrase,
      onAuthSigned: (sha256Fingerprint: string) => {
        const authKeySetForSsh: AuthKeySet = findAuthKeySetByFingerprint(sha256Fingerprint)!;
        snackbarIcon.value = mdiKey;
        snackbarMessage.value = `Signed by ${authKeySetForSsh.name}`;
        showsSnackbar.value = true;
      },
      async onHostKey({ key }): Promise<boolean> {
        if (serverHostKeyManager.isTrusted(key.fingerprint)) {
          return true;
        }
        const answer: string | undefined = await showPrompt({
          title: "New host",
          message: `${key.type} key fingerprint is ${key.fingerprint}\nAre you sure you want to continue connecting?`,
          placeholder: "yes/no/[fingerprint]",
          width: "60vw",
        });
        if (answer === "yes" || answer === key.fingerprint) {
          serverHostKeyManager.trust(key.fingerprint);
          return true;
        }
        canceled.value = true;
        return false;
      },
      onConnected() {
        connectionState.value = "connected";
      },
    }));
    snackbarIcon.value = mdiCheck;
    snackbarMessage.value = "Finished";
    showsSnackbar.value = true;
    // TODO: remove wait. this wait is for toast. create global toast and use it
    await new Promise(resolve => setTimeout(resolve, 2000));
    emit('end');
  } catch (e) {
    if (canceled.value) {
      snackbarIcon.value = mdiCancel;
      snackbarMessage.value = "Canceled";
      showsSnackbar.value = true;
      // TODO: remove wait. this wait is for toast. create global toast and use it
      await new Promise(resolve => setTimeout(resolve, 2000));
      emit('end');
      return;
    }
    // TODO: better handling
    console.error("SSH error", e);
    alert(`SSH error: ${e}`);
    emit('end');
  }
}
</script>
