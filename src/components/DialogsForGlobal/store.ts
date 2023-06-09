import {reactive} from "vue";

// TODO: support multiple dialogs ?
export const dialogsForGlobalStore = reactive({
  title: "",
  message: "",
  inputType: "",
  shows: false,
  placeholder: "",
  width: "",
  resolveInput: (input: string | undefined) => {},
});

export function showPrompt({title, message, inputType = "text", placeholder, width = "auto"}: {
  title: string,
  message: string,
  inputType?: "text" | "password",
  placeholder?: string,
  width?: string,
}): Promise<string | undefined> {
  dialogsForGlobalStore.title = title;
  dialogsForGlobalStore.message = message;
  dialogsForGlobalStore.inputType = inputType;
  dialogsForGlobalStore.placeholder = placeholder ?? "";
  dialogsForGlobalStore.width = width;
  dialogsForGlobalStore.shows = true;

  return new Promise((resolve) => dialogsForGlobalStore.resolveInput = resolve);
}
