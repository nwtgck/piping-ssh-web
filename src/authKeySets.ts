import {computed, reactive, ref, watch} from "vue";
import {localStorageKeys} from "@/localStorageKeys";
import {sessionStorageKeys} from "@/sessionStorageKeys";
import {sshSha256Fingerprint} from "@/go-wasm-using-worker";
import {z} from "zod";

export const authKeysStoreTypes = [
  "memory",
  "session_storage",
  "local_storage",
] as const;

export type AuthKeysStoreType = (typeof authKeysStoreTypes)[number];

export type AuthKeySet = {
  name: string,
  publicKey: string,
  privateKey: string,
  storeType: AuthKeysStoreType,
};

const storedAuthKeySetType = z.object({
  name: z.string(),
  publicKey: z.string(),
  privateKey: z.string(),
  storeType: z.union([z.literal("memory"), z.literal("session_storage"), z.literal("local_storage")]),
  sha256Fingerprint: z.string(),
  createdAtMillis: z.number(),
  enabled: z.boolean(),
});

export type StoredAuthKeySet = z.infer<typeof storedAuthKeySetType>;

async function authKeySetToStored(authKeySet: AuthKeySet): Promise<StoredAuthKeySet> {
  return {
    name: authKeySet.name,
    publicKey: authKeySet.publicKey,
    privateKey: authKeySet.privateKey,
    storeType: authKeySet.storeType,
    sha256Fingerprint: await sshSha256Fingerprint(authKeySet.publicKey),
    createdAtMillis: new Date().getTime(),
    enabled: true,
  };
}

const memoryAuthKeySetMap = ref<Map<string, StoredAuthKeySet>>(new Map());

function useStorageAuthKeySets(storage: Storage, key: string) {
  const values = reactive<StoredAuthKeySet[]>((() => {
    const item = storage.getItem(key);
    if (item === null) {
      return [];
    }
    return validateParseStoredAuthKeySets(JSON.parse(item));
  })());
  watch(values, () => {
    storage.setItem(key, JSON.stringify(values));
  });
  return values;
}

function validateParseStoredAuthKeySets(decoded: unknown): StoredAuthKeySet[] {
  const parsedUnknownArray = z.array(z.unknown()).safeParse(decoded);
  if (!parsedUnknownArray.success) {
    console.warn("failed to parse stored auth key sets as an array", parsedUnknownArray.error);
    return [];
  }
  const parsed = parsedUnknownArray.data
    .flatMap(e => {
      const parsedE = storedAuthKeySetType.safeParse(e);
      if (!parsedE.success) {
        // side effect in .flatMap()
        console.warn("failed to parse stored auth key set", e, parsedE.error);
        return [];
      }
      return [parsedE.data];
    });
  return parsed;
}

const sessionStorageAuthKeySets = useStorageAuthKeySets(window.sessionStorage, sessionStorageKeys.authKeySets);
const localStorageAuthKeySets = useStorageAuthKeySets(window.localStorage, localStorageKeys.authKeySets);

const storedAuthKeySetMap = computed<Map<string, StoredAuthKeySet>>(() => {
  return new Map([
    ...memoryAuthKeySetMap.value.entries(),
    ...sessionStorageAuthKeySets.map(s => [s.sha256Fingerprint, s] as const),
    ...localStorageAuthKeySets.map(s => [s.sha256Fingerprint, s] as const),
  ]);
});

export const storedAuthKeySets = computed<StoredAuthKeySet[]>(() => {
  return [...storedAuthKeySetMap.value.values()]
    .sort((a, b) => a.createdAtMillis - b.createdAtMillis);
});

export function findStoredAuthKeySetByFingerprint(sha256Fingerprint: string): StoredAuthKeySet | undefined {
  return storedAuthKeySetMap.value.get(sha256Fingerprint)
}

export async function storeAuthKeySet(authKeySet: AuthKeySet): Promise<"stored" | "already_exist"> {
  const storedAuthKeySet = await authKeySetToStored(authKeySet);
  if (storedAuthKeySetMap.value.has(storedAuthKeySet.sha256Fingerprint)) {
    return "already_exist";
  }
  addStoredAuthKeySet(storedAuthKeySet);
  return "stored";
}

function addStoredAuthKeySet(storedAuthKeySet: StoredAuthKeySet) {
  switch (storedAuthKeySet.storeType) {
    case "memory":
      memoryAuthKeySetMap.value.set(storedAuthKeySet.sha256Fingerprint, storedAuthKeySet);
      break;
    case "session_storage":
      sessionStorageAuthKeySets.push(storedAuthKeySet);
      break;
    case "local_storage":
      localStorageAuthKeySets.push(storedAuthKeySet);
      break;
  }
}

export function removeAuthKeySet(sha256Fingerprint: string) {
  memoryAuthKeySetMap.value.delete(sha256Fingerprint);
  const idx1 = sessionStorageAuthKeySets.findIndex(s => s.sha256Fingerprint === sha256Fingerprint);
  if (idx1 !== -1) {
    sessionStorageAuthKeySets.splice(idx1, 1);
  }
  const idx2 = localStorageAuthKeySets.findIndex(s => s.sha256Fingerprint === sha256Fingerprint);
  if (idx2 !== -1) {
    localStorageAuthKeySets.splice(idx2, 1);
  }
}

export function updateAuthKeySet(newStoredAuthKeySet: StoredAuthKeySet) {
  removeAuthKeySet(newStoredAuthKeySet.sha256Fingerprint);
  addStoredAuthKeySet(newStoredAuthKeySet);
}
