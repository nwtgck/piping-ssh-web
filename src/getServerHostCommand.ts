import urlJoin from "url-join";

export function getServerHostCommand({pipingServerUrl, csPath, scPath, sshServerPort}: {
  pipingServerUrl: string, csPath: string, scPath: string, sshServerPort: string | number
}): string {
  return [
    `curl -sSN ${urlJoin(pipingServerUrl, csPath)}`,
    `nc localhost ${sshServerPort}`,
    `curl -sSNT - ${urlJoin(pipingServerUrl, scPath)}`,
  ].join(" | ");
}
