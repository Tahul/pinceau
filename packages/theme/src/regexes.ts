export function helperRegex(helperFunction: string) { return new RegExp(`\\${helperFunction}\\(['|\`|"]([a-zA-Z0-9.]+)['|\`|"](?:,\\s*(['|\`|"]([a-zA-Z0-9.]+)['|\`|"]))?\\)?`, 'g') }
