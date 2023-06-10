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

                <v-btn type="submit" :disabled="!formValid" block class="mt-8" color="secondary">Connect</v-btn>
              </v-form>

              <v-spacer style="margin-top: 4rem;"/>
              <v-textarea label="server-host command" v-model="serverHostCommandEditing" variant="outlined" rows="2" class="text-grey">
                <template v-slot:append-inner>
                  <CopyToClipboardButton :text="serverHostCommandEditing"/>
                </template>
              </v-textarea>

              <v-btn color="grey" @click="setConfiguredUrl()" :prepend-icon="mdiFire">
                Set configured URL
              </v-btn>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>

      <PipingSsh v-if="connecting" :piping-server-url="pipingServerUrl" :cs-path="csPath" :sc-path="scPath" :username="username" @end="connecting = false"/>
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
          <v-row justify="end" class="ma-1">
            <v-col cols="2">
              <v-btn @click="newKeyDialog = !newKeyDialog" :prepend-icon="mdiPlus" color="secondary">New</v-btn>
            </v-col>
            <v-col cols="3">
              <v-btn @click="generateKeyDialog = !generateKeyDialog" :prepend-icon="mdiAutoFix" color="secondary">Generate</v-btn>
            </v-col>
          </v-row>
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
import {mdiConsoleLine, mdiKey, mdiPlus, mdiAutoFix, mdiGithub, mdiClose, mdiFire} from "@mdi/js";
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

const csPath = ref<string>(fragmentParams.csPath() ?? randomString(4));
const scPath = ref<string>(fragmentParams.scPath() ?? randomString(4));
const username = ref<string>(fragmentParams.sshUsername() ?? "");

const formValid = ref(false);
const connecting = ref<boolean>(false);

function connect() {
  connecting.value = true;
}

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
    csPath: csPath.value,
    scPath: scPath.value,
    sshServerPort: fragmentParams.sshServerPortForHint() ?? 22,
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
    pipingServerHeaders: undefined,
    csPath: csPath.value,
    scPath: scPath.value,
    sshUsername: username.value,
    sshPassword: undefined,
    sshServerPortForHint: "22",
    autoConnect: undefined,
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
