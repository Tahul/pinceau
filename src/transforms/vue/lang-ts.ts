export function replaceStyleTs(code: string, id: string) {
  if (id.endsWith('.vue') && !id.includes('?')) {
    const styleTagRe = /<style\b(.*?)\blang=['"][tj]sx?['"](.*?)>/g
    if (code.match(styleTagRe)) {
      return code.replace(styleTagRe, '<style$1lang="postcss"$2>')
    }
  }
  return code
}
