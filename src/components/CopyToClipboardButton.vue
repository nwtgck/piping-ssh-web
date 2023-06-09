<template>
  <!-- Without disabled, "Copied" showed when hover -->
  <v-tooltip :model-value="showsCopied" location="bottom" disabled>
    <template v-slot:activator="{props}">
      <v-btn @click="copy()" v-bind="props" :icon="mdiContentCopy" variant="text"/>
    </template>
    <span>Copied</span>
  </v-tooltip>
</template>

<script setup lang="ts">
import {mdiContentCopy} from "@mdi/js";
import {ref} from "vue";
const clipboardCopyAsync = () => import("clipboard-copy").then(p => p.default);

const props = defineProps<{
  text: string,
}>();

const showsCopied = ref(false);

async function copy() {
  const clipboardCopy = await clipboardCopyAsync()
  await clipboardCopy(props.text);
  showsCopied.value = true;
  await new Promise(resolve => setTimeout(resolve, 2000));
  showsCopied.value = false;
}
</script>
