import {localStorageKeys} from "./localStorageKeys";
import {z} from "zod";

const key = localStorageKeys.knownHostKeyFingerprints;
const dataType = z.array(z.string());

export class ServerHostKeyManager {
  trust(fingerprint: string) {
    const value: z.infer<typeof dataType>  = [...this.getTrustedFingerPrints(), fingerprint];
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  }

  isTrusted(fingerprint: string): boolean {
    return this.getTrustedFingerPrints().includes(fingerprint);
  }

  private getTrustedFingerPrints(): string[] {
    const decoded = JSON.parse((localStorage.getItem(key) ?? "[]"));
    const parsed = dataType.safeParse(decoded);
    if (!parsed.success) {
      return [];
    }
    return parsed.data;
  }
}
