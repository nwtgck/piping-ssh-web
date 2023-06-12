// (from: https://web.dev/fetch-upload-streaming/#feature-detection)
// (from: https://github.com/whatwg/fetch/issues/1275#issue-955832232)
export const supportsRequestStreamsPromise = (async () => {
  const supportsStreamsInRequestObjects = !new Request('', {
    method: 'POST',
    body: new ReadableStream(),
    duplex: 'half',
  } as any).headers.has('Content-Type');

  if (!supportsStreamsInRequestObjects) return false;

  return fetch('data:a/a;charset=utf-8,', {
    method: 'POST',
    body: new ReadableStream(),
    duplex: 'half',
  } as any).then(() => true, () => false);
})();
