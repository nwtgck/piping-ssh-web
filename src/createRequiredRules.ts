export function createRequiredRules(name: string): Array<(v: unknown) => boolean | string> {
  return [v => !!v || `${name} is required.`];
}
