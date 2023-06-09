<template>
  <v-expansion-panels v-model="expandedIndex" variant="accordion">
    <v-expansion-panel v-for="editing in editingStoredAuthKeySets" :key="editing.sha256Fingerprint">
      <template v-slot:title>
        <v-icon :icon="mdiKey" style="margin-right: 1rem;" :color="editing.enabled ? '' : 'grey'"/>
        <div :class="{'text-grey': !editing.enabled, 'font-italic': keySetChanged(editing)}">
          <div style="margin-bottom: 0.5rem;">{{ editing.name }}</div>
          <div style="font-size: 0.8rem;">{{editing.sha256Fingerprint}}</div>
        </div>
      </template>
      <!-- TODO: show added_at -->
      <!-- TODO: show last_used_at -->
      <v-expansion-panel-text>
        <v-switch label="Enabled" v-model="editing.enabled" color="info" inset></v-switch>
        <v-text-field label="name" v-model="editing.name" variant="solo-filled"/>
        <v-radio-group label="Store type" v-model="editing.storeType" inline>
          <v-radio v-for="t in authKeysStoreTypes" :id="t" :label="strings?.store_type(t) ?? ''" :value="t"/>
        </v-radio-group>
        <!-- NOTE: Should not make public key and private key updatable because keys are identified by fingerprint. -->
        <v-btn color="secondary" @click="updateAuthKeySet(editing)" :disabled="!keySetChanged(editing)" style="margin-bottom: 2rem;">Update</v-btn>
        <v-textarea label="public key" :model-value="editing.publicKey" :readonly="true" variant="solo-filled">
          <template v-slot:append-inner>
            <CopyToClipboardButton :text="editing.publicKey"/>
            <v-btn @click="downloadText(`${editing.name}-pub.pem`, editing.publicKey)" :icon="mdiDownload" color="orange" variant="text"></v-btn>
          </template>
        </v-textarea>

        <v-text-field :model-value="addToAuthorizedKeys(editing.publicKey)" label="Command to add to ~/.ssh/authorized_keys" variant="solo-filled" :readonly="true">
          <template v-slot:append-inner>
            <CopyToClipboardButton :text="addToAuthorizedKeys(editing.publicKey)"/>
          </template>
        </v-text-field>

        <DefinePrivateKeyAppendInner>
          <CopyToClipboardButton :text="editing.privateKey"/>
          <v-btn @click="fingerprintToShowPrivateKey[editing.sha256Fingerprint] = !fingerprintToShowPrivateKey[editing.sha256Fingerprint]" :icon="fingerprintToShowPrivateKey[editing.sha256Fingerprint] ? mdiEyeOff : mdiEye" variant="text"></v-btn>
          <v-btn @click="downloadText(`${editing.name}-priv.pem`, editing.privateKey)" :icon="mdiDownload" color="orange" variant="text"></v-btn>
        </DefinePrivateKeyAppendInner>
        <v-textarea v-if="fingerprintToShowPrivateKey[editing.sha256Fingerprint]" label="private key" :model-value="editing.privateKey" :readonly="true" variant="solo-filled">
          <template v-slot:append-inner>
            <ReusePrivateKeyAppendInner/>
          </template>
        </v-textarea>
        <v-text-field v-if="!fingerprintToShowPrivateKey[editing.sha256Fingerprint]" label="private key" type="password" :model-value="editing.privateKey" :readonly="true" variant="solo-filled">
          <template v-slot:append-inner>
            <ReusePrivateKeyAppendInner/>
          </template>
        </v-text-field>

        <v-btn @click="removeKeys(editing.sha256Fingerprint)" :prepend-icon="mdiDelete" color="red" class="ma-2">Delete</v-btn>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="tsx">
import {mdiDelete, mdiDownload, mdiEye, mdiEyeOff, mdiKey} from "@mdi/js";
import {strings} from "@/strings/strings";
import {
  authKeysStoreTypes,
  findStoredAuthKeySetByFingerprint,
  removeAuthKeySet,
  StoredAuthKeySet,
  storedAuthKeySets,
  updateAuthKeySet
} from "@/authKeySets";
import {ref, watch} from "vue";
import { createReusableTemplate } from '@vueuse/core';
import CopyToClipboardButton from "@/components/CopyToClipboardButton.vue"

const [DefinePrivateKeyAppendInner, ReusePrivateKeyAppendInner] = createReusableTemplate();

const expandedIndex = ref<number>();
const editingStoredAuthKeySets = ref<StoredAuthKeySet[]>([]);
const fingerprintToShowPrivateKey = ref<{[sha2256fingerprint: string]: boolean | undefined}>({});

watch(storedAuthKeySets, () => {
  editingStoredAuthKeySets.value = structuredClone(storedAuthKeySets.value);
}, {
  immediate: true,
});

function keySetChanged(editing: StoredAuthKeySet): boolean {
  const source = findStoredAuthKeySetByFingerprint(editing.sha256Fingerprint);
  if (source === undefined) {
    return false;
  }
  return editing.name !== source.name || editing.enabled !== source.enabled || editing.storeType !== source.storeType;
}

function removeKeys(sha256Fingerprint: string) {
  expandedIndex.value = undefined;
  // TODO: confirm deletion OR undo feature
  removeAuthKeySet(sha256Fingerprint);
}

function addToAuthorizedKeys(publicKey: string): string {
  return `mkdir -p ~/.ssh && echo '${publicKey.trim()}' >> ~/.ssh/authorized_keys`;
}

function downloadText(name: string, str: string) {
  const url = URL.createObjectURL(new Blob([str]));
  const a = document.createElement("a");
  a.download = name;
  a.href = url;
  a.click();
  // TODO: revoke URL
}
</script>
