<template>
  <v-snackbar v-model="globalSnackbarStore.shows" location="top" :timeout="2500">
    <v-icon v-if="globalSnackbarStore.icon !== undefined" :icon="globalSnackbarStore.icon"></v-icon>
    {{ globalSnackbarStore.message }}
  </v-snackbar>
</template>

<script setup lang="ts">
import {globalSnackbarStore} from "@/components/Globals/snackbar/global-snackbar";
</script>
