declare var self: Worker;

// @ts-ignore
import '../public/wasm_exec.js';
import {goWasmExportedPromise, GoWasmExported, goWasmExisted} from "@/go-wasm-exported-promise";
import * as Comlink from 'comlink';

// e.g. `(a: number, b: boolean) => string` → `(a: number, b: boolean) => Promise<string>`
type ToAsyncFunction<T extends (...args: any) => any> =
  T extends (...args: infer P) => any
    ? (...args: P) => Promise<Awaited<ReturnType<T>>>
    : never;

export type GoWasmWorkerObject = {
  [P in keyof GoWasmExported]: ToAsyncFunction<GoWasmExported[P]>
} & {
  existed(): boolean,
};

const goWasmWorkerObject: GoWasmWorkerObject = {
  existed(): boolean {
    return goWasmExisted();
  },
  async panicOnPurpose(): Promise<void> {
    const exported = await goWasmExportedPromise;
    await exported.panicOnPurpose();
  },
  async doSsh(params: Parameters<GoWasmExported["doSsh"]>[0], functions: Parameters<GoWasmExported["doSsh"]>[1]): Promise<void> {
    const exported = await goWasmExportedPromise;
    await exported.doSsh(params, functions);
  },
  async getAuthPublicKeyType(publicKey: string): Promise<string> {
    const exported = await goWasmExportedPromise;
    return await exported.getAuthPublicKeyType(publicKey);
  },
  // passphrase is always undefined because x509.EncryptPEMBlock() is deprecated
  async generateRsaKeys(keyBits: number): Promise<{ publicKey: string, privateKey: string }> {
    const exported = await goWasmExportedPromise;
    return exported.generateRsaKeys(keyBits);
  },
  async generateEd25519Keys(): Promise<{ publicKey: string, privateKey: string }> {
    const exported = await goWasmExportedPromise;
    return exported.generateEd25519Keys();
  },
  async sshSha256Fingerprint(publicKey: string): Promise<string> {
    const exported = await goWasmExportedPromise;
    return exported.sshSha256Fingerprint(publicKey);
  },
  async sshPrivateKeyIsEncrypted(privateKey: string): Promise<boolean> {
    const exported = await goWasmExportedPromise;
    return await exported.sshPrivateKeyIsEncrypted(privateKey);
  }
};

Comlink.expose(goWasmWorkerObject);
