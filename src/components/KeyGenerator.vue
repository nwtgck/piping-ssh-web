<template>
  <v-sheet v-if="!generated" rounded="lg" style="padding: 1rem" class="ma-2">
    <v-radio-group v-model="keyType" inline :disabled="generating">
      <v-radio v-for="t in keyTypeCandidates" :id="t" :label="t" :value="t"/>
    </v-radio-group>
    <v-radio-group v-if="keyType === 'RSA'" label="Key bits" v-model="keyBits" inline :disabled="generating">
      <v-radio v-for="c in keyBitCandidates" :id="c.toString()" :label="c.toString()" :value="c"/>
    </v-radio-group>
    <v-alert v-show="keyType === 'RSA' && keyBits >= 4096" color="info" text="It will take about 1 minute or more to generate. Ed25519 is recommended." :icon="mdiAlertCircle" variant="outlined" prominent border="top" style="margin-bottom: 1rem;"></v-alert>
    <v-btn @click="generateKeys()" :loading="generating" color="secondary">Generate</v-btn>
  </v-sheet>

  <KeysEditor v-if="generated"
              @save="emit('save', $event)"
              :initial-public-key="generatedPublicKey"
              :initial-private-key="generatedPrivateKey"/>
</template>

<script setup lang="ts">
import KeysEditor from "@/components/KeysEditor.vue";
import {computed, ref} from "vue";
import {AuthKeySet} from "@/authKeySets";
import {generateEd25519Keys, generateRsaKeys} from "@/go-wasm-using-worker";
import {mdiAlertCircle} from "@mdi/js";

const emit = defineEmits<{
  (event: 'save', authKeySet: AuthKeySet): void
}>();

const keyTypeCandidates = ["RSA", "Ed25519"] as const;
const keyType = ref<(typeof keyTypeCandidates)[number]>(keyTypeCandidates[0]);

const keyBitCandidates = [2048, 4096] as const;
const keyBits = ref<number>(keyBitCandidates[0]);

const generatedPublicKey = ref<string>();
const generatedPrivateKey = ref<string>();

const generating = ref<boolean>(false);
const generated = computed<boolean>(() => {
  return generatedPublicKey.value !== undefined && generatedPrivateKey.value !== undefined;
});

async function generateKeys() {
  try {
    generating.value = true;
    // TODO: implement
    // passphrase is always undefined because x509.EncryptPEMBlock() in Go is deprecated
    const passphrase = undefined;
    const keys = await (async () => {
      switch (keyType.value) {
        case "RSA":
          return await generateRsaKeys(keyBits.value, passphrase);
        case "Ed25519":
          return await generateEd25519Keys(passphrase);
      }
    })();
    generatedPublicKey.value = keys.publicKey;
    generatedPrivateKey.value = keys.privateKey;
  } finally {
    generating.value = false;
  }
}
</script>
