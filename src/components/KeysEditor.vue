<template>
  <v-sheet rounded="lg" style="padding: 1rem">
    <v-form @submit.prevent="save" v-model="formValid">
      <v-text-field label="name" v-model="name" variant="solo-filled" :rules="createRequiredRules('Name')"/>
      <v-radio-group label="Store type" v-model="storeType" inline>
        <v-radio v-for="t in authKeysStoreTypes" :id="t" :label="strings?.store_type(t) ?? ''" :value="t"/>
      </v-radio-group>
      <!-- TODO: add WebAuthn? -->
      <!-- TODO: import keys from file input -->
      <v-textarea label="public key" v-model="publicKey" variant="solo-filled" :rules="createRequiredRules('Private key')"/>
      <v-textarea label="private key" v-model="privateKey" type="password" variant="solo-filled" :rules="createRequiredRules('Private key')"/>
      <v-btn type="submit" :disabled="!formValid" color="secondary" class="ma-1" text="Save"></v-btn>
    </v-form>
  </v-sheet>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";
import {AuthKeySet, AuthKeysStoreType, authKeysStoreTypes, storedAuthKeySets} from "@/authKeySets";
import {strings} from "@/strings/strings";
import {getAuthPublicKeyType} from "@/go-wasm-using-worker";
import {createRequiredRules} from "@/createRequiredRules";

const props = defineProps<{
  initialPublicKey?: string,
  initialPrivateKey?: string,
}>();

const emit = defineEmits<{
  (event: 'save', authKeySet: AuthKeySet): void
}>();

const formValid = ref(false);
const name = ref<string>("");
const storeType = ref<AuthKeysStoreType>(authKeysStoreTypes[2]);
const publicKey = ref(props.initialPublicKey);
const privateKey = ref(props.initialPrivateKey);

if (props.initialPublicKey !== undefined) {
  suggestName(props.initialPublicKey);
}

watch(publicKey, () => {
  if (name === "" && publicKey.value !== undefined) {
    suggestName(publicKey.value!);
  }
});

async function suggestName(publicKey: string) {
  const type: string = await getAuthPublicKeyType(publicKey);
  let nameCandidate = type;
  const names = storedAuthKeySets.value.map(s => s.name);
  for (let n = 2; names.includes(nameCandidate); n++) {
    nameCandidate = `${type} (${n})`;
  }
  name.value = nameCandidate;
}

async function save() {
  if (!formValid.value) {
    return;
  }
  // TODO: validate valid public key and private key formats
  emit('save', {
    name: name.value,
    publicKey: publicKey.value!,
    privateKey: privateKey.value!,
    storeType: storeType.value,
  });
}
</script>
