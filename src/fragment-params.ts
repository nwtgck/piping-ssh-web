import {z} from "zod";

export const fragmentParams = {
  pipingServerUrl(): string | undefined {
    return parseFragmentParams().get("server") ?? undefined;
  },
  pipingServerHeaders(): Array<[string, string]> | undefined {
    const headersString = parseFragmentParams().get("headers");
    if (headersString === null) {
      return undefined;
    }
    let decoded: unknown;
    try {
      decoded = JSON.parse(decodeURIComponent(headersString));
    } catch {
      return undefined;
    }
    const parsed = z.array(z.tuple([z.string(), z.string()])).safeParse(decoded);
    if (!parsed.success) {
      return undefined;
    }
    return parsed.data;
  },
  csPath(): string | undefined {
    return parseFragmentParams().get("cs_path") ?? undefined;
  },
  scPath(): string | undefined {
    return parseFragmentParams().get("sc_path") ?? undefined;
  },
  sshUsername(): string | undefined {
    return parseFragmentParams().get("user") ?? undefined;
  },
  sshPassword(): string | undefined {
    return parseFragmentParams().get("password") ?? undefined;
  },
  sshServerPortForHint(): string | undefined {
    return parseFragmentParams().get("s_port") ?? undefined;
  },
  autoConnect(): boolean | undefined {
    const str = parseFragmentParams().get("auto_connect");
    return str !== null && ["", "1", "true"].includes(str);
  }
};

function parseFragmentParams(): URLSearchParams {
  const url = new URL(`a://a${location.hash.substring(1)}`);
  return url.searchParams;
}
