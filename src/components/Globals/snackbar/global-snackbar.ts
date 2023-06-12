import {reactive} from "vue";

// TODO: support multiple snackbars?
export const globalSnackbarStore = reactive({
  message: "",
  icon: undefined as (undefined | string),
  shows: false,
});

export function showSnackbar({message, icon}: {
  message: string,
  icon?: string,
}) {
  globalSnackbarStore.message = message;
  globalSnackbarStore.icon = icon;
  globalSnackbarStore.shows = true;
}
