import urlJoin from "url-join";

export function getServerHostCommand({pipingServerUrl, pipingServerHeaders, csPath, scPath, sshServerPort}: {
  pipingServerUrl: string, pipingServerHeaders: Array<[string, string]>, csPath: string, scPath: string, sshServerPort: string | number
}): string {
  const headerOptions = pipingServerHeaders.length === 0
    ? ""
    : " " + pipingServerHeaders.map(([name, value]) => `-H '${name}: ${value}'`).join(" ");
  return [
    `curl -sSN${headerOptions} ${urlJoin(pipingServerUrl, csPath)}`,
    `nc localhost ${sshServerPort}`,
    `curl -sSNT -${headerOptions} ${urlJoin(pipingServerUrl, scPath)}`,
  ].join(" | ");
}
