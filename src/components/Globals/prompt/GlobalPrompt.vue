<template>
  <v-row justify="center">
    <v-dialog v-model="globalPromptStore.shows" persistent :width="globalPromptStore.width">
      <!--NOTE: v-if for text-field autofocus -->
      <v-card v-if="globalPromptStore.shows">
        <v-card-title class="text-h5">{{ globalPromptStore.title }}</v-card-title>
        <v-card-text>
          <pre style="white-space: pre-wrap; margin-bottom: 1rem;">{{ globalPromptStore.message }}</pre>
          <v-text-field v-model="inputText"
                        @keydown.enter="ok()"
                        :placeholder="globalPromptStore.placeholder"
                        :type="globalPromptStore.inputType"
                        variant="solo-filled"
                        :autofocus="true"
          >
            <template v-if="enableShowHideUi" v-slot:append-inner>
              <v-btn @click="globalPromptStore.inputType = globalPromptStore.inputType === 'text' ? 'password' : 'text'" :icon="globalPromptStore.inputType === 'text' ? mdiEyeOff : mdiEye" variant="text"></v-btn>
            </template>
          </v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cancel()">Cancel</v-btn>
          <v-btn color="secondary" variant="text" @click="ok()">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script setup lang="ts">
import {globalPromptStore} from "./global-prompt";
import {ref, watch} from "vue";
import {mdiEye, mdiEyeOff} from "@mdi/js";

const inputText = ref<string>("");
const enableShowHideUi = ref(false);

watch(() => globalPromptStore.shows, () => {
  if (!globalPromptStore.shows) {
    return;
  }
  // Initialize when "shows" updated
  inputText.value = "";
  enableShowHideUi.value = globalPromptStore.inputType === "password";
});

function cancel() {
  globalPromptStore.shows = false;
  globalPromptStore.resolveInput(undefined);
}

function ok() {
  globalPromptStore.shows = false;
  globalPromptStore.resolveInput(inputText.value);
}
</script>
