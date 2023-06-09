import {reactive} from "vue";

// TODO: support multiple dialogs ?
export const globalPromptStore = reactive({
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
  globalPromptStore.title = title;
  globalPromptStore.message = message;
  globalPromptStore.inputType = inputType;
  globalPromptStore.placeholder = placeholder ?? "";
  globalPromptStore.width = width;
  globalPromptStore.shows = true;

  return new Promise((resolve) => globalPromptStore.resolveInput = resolve);
}
