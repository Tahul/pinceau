/**
 * Return a regex capable of finding any helper function in any kind of file.
 */
export function helperRegex(fnName: string) {
  return new RegExp(`\\${fnName}\\(['|\`|"]([a-zA-Z0-9.]+)['|\`|"](?:,\\s*(['|\`|"]([a-zA-Z0-9.]+)['|\`|"]))?\\)?`, 'g')
}
