<template>
  <v-row justify="center">
    <v-dialog v-model="dialogsForGlobalStore.shows" persistent :width="dialogsForGlobalStore.width">
      <!--NOTE: v-if for text-field autofocus -->
      <v-card v-if="dialogsForGlobalStore.shows">
        <v-card-title class="text-h5">{{dialogsForGlobalStore.title}}</v-card-title>
        <v-card-text>
          <pre style="white-space: pre-wrap; margin-bottom: 1rem;">{{ dialogsForGlobalStore.message }}</pre>
          <v-text-field v-model="inputText"
                        @keydown.enter="ok()"
                        :placeholder="dialogsForGlobalStore.placeholder"
                        :type="dialogsForGlobalStore.inputType"
                        variant="solo-filled"
                        :autofocus="true"
          >
            <template v-if="enableShowHideUi" v-slot:append-inner>
              <v-btn @click="dialogsForGlobalStore.inputType = dialogsForGlobalStore.inputType === 'text' ? 'password' : 'text'" :icon="dialogsForGlobalStore.inputType === 'text' ? mdiEyeOff : mdiEye" variant="text"></v-btn>
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
import {dialogsForGlobalStore} from "./store";
import {ref, watch} from "vue";
import {mdiEye, mdiEyeOff} from "@mdi/js";

const inputText = ref<string>("");
const enableShowHideUi = ref(false);

watch(() => dialogsForGlobalStore.shows, () => {
  if (!dialogsForGlobalStore.shows) {
    return;
  }
  // Initialize when "shows" updated
  inputText.value = "";
  enableShowHideUi.value = dialogsForGlobalStore.inputType === "password";
});

function cancel() {
  dialogsForGlobalStore.shows = false;
  dialogsForGlobalStore.resolveInput(undefined);
}

function ok() {
  dialogsForGlobalStore.shows = false;
  dialogsForGlobalStore.resolveInput(inputText.value);
}
</script>
