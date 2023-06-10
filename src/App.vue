<template>
  <v-app theme="dark">
    <v-app-bar flat>
      <v-container class="d-flex align-center">
        <v-avatar class="me-4 ms-4" color="grey-darken-3" size="32">
          <v-icon :icon="mdiConsoleLine"/>
        </v-avatar>
        <a href="" class="me-4 font-weight-bold" style="color: inherit; text-decoration: none">
          Piping SSH
        </a>

        <v-spacer></v-spacer>

        <!-- TODO: manage known hosts -->
        <v-btn @click="keyManagerDialog = !keyManagerDialog" variant="text" :prepend-icon="mdiKey">
          Manage keys
        </v-btn>
        <v-btn :icon="mdiGithub" href="https://github.com/nwtgck/piping-ssh-web" target="_blank"/>
      </v-container>
    </v-app-bar>

    <v-main>
      <v-container v-if="!connecting">
        <v-row>
          <v-col>
            <v-sheet min-height="70vh" rounded="lg" style="padding: 1rem">
              <v-form @submit.prevent="connect" v-model="formValid">
                <v-combobox label="Piping Server" v-model="pipingServerUrl" :items="pipingServerUrls" required variant="solo-filled" :rules="createRequiredRules('Piping Server')"></v-combobox>
                <v-row>
                  <v-col>
                    <v-text-field label="client-server path" v-model="csPath" required variant="solo-filled" :rules="createRequiredRules('client-server path')"></v-text-field>
                  </v-col>
                  <v-col>
                    <v-text-field label="server-client path" v-model="scPath" required variant="solo-filled" :rules="createRequiredRules('server-client path')"></v-text-field>
                  </v-col>
                </v-row>
                <v-text-field label="user name" v-model="username" required variant="solo-filled" :rules="createRequiredRules('user name')"></v-text-field>

                <template v-if="showsMoreOptions">
                  <!-- HTTP header inputs -->
                  <v-row v-for="(header, idx) in editingPipingServerHeaders">
                    <v-col>
                      <v-text-field v-model="header[0]" :label="`HTTP header name ${idx + 1}`" variant="solo-filled"></v-text-field>
                    </v-col>
                    <v-col>
                      <v-text-field v-model="header[1]" :label="`HTTP header value ${idx + 1}`" variant="solo-filled"></v-text-field>
                    </v-col>
                    <v-col>
                      <v-btn :icon="mdiMinus" @click="editingPipingServerHeaders.splice(idx, 1)" variant="text"></v-btn>
                    </v-col>
                  </v-row>
                  <v-btn @click="editingPipingServerHeaders.push(['', ''])" :prepend-icon="mdiPlus" variant="outlined" style="margin-bottom: 1rem; text-transform: none">
                    Add header
                  </v-btn>

                  <v-text-field v-model="sshServerPortForCommandHint" label="SSH server port for command" variant="solo-filled"></v-text-field>
                  <v-text-field v-model="editingSshPassword" label="SSH password" :type="showsSshPassword ? 'text' : 'password'" variant="solo-filled">
                    <template v-slot:append-inner>
                      <v-btn @click="showsSshPassword = !showsSshPassword" :icon="showsSshPassword ? mdiEyeOff : mdiEye" variant="text"></v-btn>
                    </template>
                  </v-text-field>
                  <v-checkbox v-model="emptySshPassword" label="Empty SSH password"></v-checkbox>
                  <v-checkbox v-model="includesSshPasswordInFragmentParams" label="Include SSH password in configured URL"></v-checkbox>
                  <v-checkbox v-model="autoConnectForFragmentParams" label="Auto connect for configured URL"></v-checkbox>
                </template>

                <v-btn type="submit" :disabled="!formValid" block class="mt-8" color="secondary">Connect</v-btn>

                <v-btn @click="showsMoreOptions = !showsMoreOptions" :prepend-icon="showsMoreOptions ? mdiCollapseAll : mdiExpandAll" variant="text" style="margin-top: 1.2rem; text-transform: none">
                  {{ showsMoreOptions ? "Hide options" : "More options" }}
                </v-btn>
              </v-form>

              <v-spacer style="margin-top: 4rem;"/>
              <v-textarea label="server-host command" v-model="serverHostCommandEditing" variant="outlined" rows="2" class="text-grey">
                <template v-slot:append-inner>
                  <CopyToClipboardButton :text="serverHostCommandEditing"/>
                </template>
              </v-textarea>

              <v-btn color="grey" @click="setConfiguredUrl()" :prepend-icon="mdiFire" variant="outlined" style="text-transform: none">
                Set configured URL
              </v-btn>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>

      <PipingSsh v-if="connecting"
                 :piping-server-url="pipingServerUrl"
                 :piping-server-headers="pipingServerHeaders"
                 :default-ssh-password="sshPassword"
                 :cs-path="csPath"
                 :sc-path="scPath"
                 :username="username"
                 @end="connecting = false"
      />
    </v-main>

    <v-dialog v-model="keyManagerDialog" scrollable width="90vw">
      <v-card>
        <v-card-title class="d-flex">
          <div class="ma-2">Keys</div>
          <v-spacer/>
          <v-btn @click="keyManagerDialog = false" :icon="mdiClose" variant="text"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text style="min-height: 70vh;">
          <div style="text-align: end">
            <v-btn @click="newKeyDialog = !newKeyDialog" :prepend-icon="mdiPlus" color="secondary" style="margin-right: 1rem;">
              New
            </v-btn>
            <v-btn @click="generateKeyDialog = !generateKeyDialog" :prepend-icon="mdiAutoFix" color="secondary">
              Generate
            </v-btn>
          </div>
          <KeyManager />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="newKeyDialog" width="80vw">
      <v-card>
        <v-card-title class="d-flex">
          <div class="ma-2">New key</div>
          <v-spacer/>
          <v-btn @click="newKeyDialog = false" :icon="mdiClose" variant="text"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text style="min-height: 70vh;">
          <KeysEditor @save="saveAuthKeySet($event)"/>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="generateKeyDialog" width="80vw">
      <v-card>
        <v-card-title class="d-flex">
          <div class="ma-2">Key generator</div>
          <v-spacer/>
          <v-btn @click="generateKeyDialog = false" :icon="mdiClose" variant="text"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text style="min-height: 70vh;">
          <KeyGenerator @save="saveAuthKeySet($event)"/>
        </v-card-text>
      </v-card>
    </v-dialog>
    <DialogsForGlobal />
  </v-app>
</template>

<script setup lang="ts">
// TODO: detect fetch() feature
import {computed, onMounted, ref, defineAsyncComponent, watch} from "vue";
import {fragmentParams, getConfiguredUrl} from "@/fragment-params";
import {mdiConsoleLine, mdiKey, mdiPlus, mdiAutoFix, mdiGithub, mdiClose, mdiFire, mdiCollapseAll, mdiExpandAll, mdiMinus, mdiEyeOff, mdiEye} from "@mdi/js";
import {AuthKeySet, storeAuthKeySet} from "@/authKeySets";
import {getServerHostCommand} from "@/getServerHostCommand";
import CopyToClipboardButton from "@/components/CopyToClipboardButton.vue";
import {createRequiredRules} from "@/createRequiredRules";
import DialogsForGlobal from "@/components/Globals/Globals.vue";
import {showSnackbar} from "@/components/Globals/snackbar/global-snackbar";
const PipingSsh = defineAsyncComponent(() => import("@/components/PipingSsh.vue"));
const KeyManager = defineAsyncComponent(() => import("@/components/KeyManager.vue"));
const KeysEditor = defineAsyncComponent(() => import("@/components/KeysEditor.vue"));
const KeyGenerator = defineAsyncComponent(() => import("@/components/KeyGenerator.vue"));

const pipingServerUrl = ref<string>(fragmentParams.pipingServerUrl() ?? "https://ppng.io");
const pipingServerUrls = ref<string[]>([
  "https://ppng.io",
  "https://piping.nwtgck.repl.co",
]);
const editingPipingServerHeaders = ref<Array<[string, string]>>(fragmentParams.pipingServerHeaders() ?? []);
const pipingServerHeaders = computed<Array<[string, string]>>(() => {
  return editingPipingServerHeaders.value.filter(([name,value]) => name !== "");
});
const csPath = ref<string>(fragmentParams.csPath() ?? randomString(4));
const scPath = ref<string>(fragmentParams.scPath() ?? randomString(4));
const username = ref<string>(fragmentParams.sshUsername() ?? "");
const sshServerPortForCommandHint = ref<string>(fragmentParams.sshServerPortForHint() ?? "22");

const editingSshPassword = ref<string>(fragmentParams.sshPassword() ?? "");
const showsSshPassword = ref(false);
const emptySshPassword = ref<boolean>(fragmentParams.sshPassword() === "");
const sshPassword = computed<string | undefined>(() => {
  if (editingSshPassword.value === "" && !emptySshPassword.value) {
    return undefined;
  }
  return editingSshPassword.value;
});

const includesSshPasswordInFragmentParams = ref<boolean>(fragmentParams.sshPassword() !== undefined);
const autoConnectForFragmentParams = ref<boolean>(fragmentParams.autoConnect() ?? false);

const formValid = ref(false);
const connecting = ref<boolean>(false);

function connect() {
  connecting.value = true;
}

const showsMoreOptions = ref(false);
const keyManagerDialog = ref(false);
const newKeyDialog = ref(false);
const generateKeyDialog = ref(false);

onMounted(() => {
  if (fragmentParams.autoConnect()) {
    connect();
  }
});

const serverHostCommandEditing = ref<string>("");
const serverHostCommand = computed<string>(() => {
  return getServerHostCommand({
    // NOTE: v-combobox makes pipingServerUrl null
    pipingServerUrl: pipingServerUrl.value ?? "",
    pipingServerHeaders: pipingServerHeaders.value,
    csPath: csPath.value,
    scPath: scPath.value,
    sshServerPort: sshServerPortForCommandHint.value,
  });
});
watch(serverHostCommand, () => {
  serverHostCommandEditing.value = serverHostCommand.value;
}, {
  immediate: true,
});

async function saveAuthKeySet(authKeySet: AuthKeySet) {
  newKeyDialog.value = false;
  generateKeyDialog.value = false;
  await storeAuthKeySet(authKeySet);
}

function randomString(len){
  const nonConfusingChars = ["a", "b", "c", "d", "e", "f", "h", "i", "j", "k", "m", "n", "p", "r", "s", "t", "u", "v", "w", "x", "y", "z", "2", "3", "4", "5", "6", "7", "8"];
  const randomArr = window.crypto.getRandomValues(new Uint32Array(len));
  return Array.from(randomArr).map(n => nonConfusingChars[n % nonConfusingChars.length]).join('');
}

function setConfiguredUrl() {
  location.href = getConfiguredUrl({
    pipingServerUrl: pipingServerUrl.value,
    pipingServerHeaders: pipingServerHeaders.value,
    csPath: csPath.value,
    scPath: scPath.value,
    sshUsername: username.value,
    sshPassword: includesSshPasswordInFragmentParams.value ? sshPassword.value : undefined,
    sshServerPortForHint: sshServerPortForCommandHint.value,
    autoConnect: autoConnectForFragmentParams.value,
  });
  showSnackbar({
    message: "URL updated",
  });
}
</script>

<style>
#app {
  font-family: "Avenir Next", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  //text-align: center;
  color: #2c3e50;
  margin-top: 15px;
}
</style>
