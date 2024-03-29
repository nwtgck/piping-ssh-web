import * as Comlink from'comlink';
import type {GoWasmWorkerObject} from "@/go-wasm-worker";

let [goWasmWorkerRemote, worker] = createGoWasmWorkerRemote();

function createGoWasmWorkerRemote(): [Comlink.Remote<GoWasmWorkerObject>, Worker] {
  const worker = new Worker(new URL('./go-wasm-worker.ts', import.meta.url));
  return [Comlink.wrap<GoWasmWorkerObject>(worker), worker];
}

export async function aliveGoWasmWorkerRemotePromise(): Promise<Comlink.Remote<GoWasmWorkerObject>> {
  // recreate remote if existed
  if (await goWasmWorkerRemote.existed()) {
    worker.terminate();
    console.warn("recreating remote...");
    [goWasmWorkerRemote, worker] = createGoWasmWorkerRemote();
  }
  return goWasmWorkerRemote;
}

export async function getAuthPublicKeyType(publicKey: string): Promise<string> {
  return await (await aliveGoWasmWorkerRemotePromise()).getAuthPublicKeyType(publicKey);
}

// passphrase is always undefined because x509.EncryptPEMBlock() is deprecated
export async function generateRsaKeys(keyBits: number, passphrase: undefined): Promise<{ publicKey: string, privateKey: string }> {
  return (await aliveGoWasmWorkerRemotePromise()).generateRsaKeys(keyBits);
}

export async function generateEd25519Keys(passphrase: undefined): Promise<{ publicKey: string, privateKey: string }> {
  return (await aliveGoWasmWorkerRemotePromise()).generateEd25519Keys();
}

export async function sshSha256Fingerprint(publicKey: string): Promise<string> {
  return await (await aliveGoWasmWorkerRemotePromise()).sshSha256Fingerprint(publicKey);
}

export async function sshPrivateKeyIsEncrypted(privateKey: string): Promise<boolean> {
  return await (await aliveGoWasmWorkerRemotePromise()).sshPrivateKeyIsEncrypted(privateKey);
}
