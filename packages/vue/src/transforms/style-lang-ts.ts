/**
 * Transforms the `<style lang="ts">` attribute into `<style lang="postcss">`.
 *
 * This transforms does not use MagicString as it is directly targeted at the Vue compiler that will trim it off.
 *
 * This is used from `loadFile` and `loadBlock` from Vue Pinceau transformer.
 */
export function transformStyleTs(code: string = '') {
  const styleTagRe = /<style\b(.*?)\blang=['"][tj]sx?['"](.*?)>/g
  if (code.match(styleTagRe)) { code = code.replace(styleTagRe, '<style$1lang="postcss" pctransformed$2>') }
  return code
}
