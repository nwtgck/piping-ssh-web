import type {AuthKeysStoreType} from "@/authKeySets";

// TODO: add more. almost text are hard coded
const en = {
  store_type(type: AuthKeysStoreType): string {
    switch (type) {
      case "memory":
        return "memory";
      case "local_storage":
        return "local storage";
      case "session_storage":
        return "session storage";
    }
  }
  // store_type: 保管場所 in ja
};
export default en;

export type Strings = typeof en;
