import {reactive} from "vue";

// TODO: support multiple dialogs?
export const globalPromptStore = reactive({
  title: "",
  message: "",
  showsInput: false,
  inputType: "",
  shows: false,
  placeholder: "",
  width: "",
  resolveInput: (input: string | undefined) => {},
});

export function showPrompt({title, showsInput = true, message, inputType = "text", placeholder, width = "auto"}: {
  title: string,
  showsInput?: boolean,
  message: string,
  inputType?: "text" | "password",
  placeholder?: string,
  width?: string,
}): Promise<string | undefined> {
  globalPromptStore.title = title;
  globalPromptStore.message = message;
  globalPromptStore.showsInput = showsInput;
  globalPromptStore.inputType = inputType;
  globalPromptStore.placeholder = placeholder ?? "";
  globalPromptStore.width = width;
  globalPromptStore.shows = true;

  return new Promise((resolve) => globalPromptStore.resolveInput = resolve);
}
