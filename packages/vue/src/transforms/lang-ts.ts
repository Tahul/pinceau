import type { PinceauQuery } from '@pinceau/shared'

/**
 * Transforms the `<style lang="ts">` attribute into `<style lang="postcss">`.
 *
 * This transforms does not use MagicString as it is directly targeted at the Vue compiler that will trim it off.
 */
export function transformStyleTs(code: string, query?: PinceauQuery, force = false) {
  if (force || (query && query.id.endsWith('.vue') && !query.id.includes('?'))) {
    const styleTagRe = /<style\b(.*?)\blang=['"][tj]sx?['"](.*?)>/g
    if (code.match(styleTagRe)) { code = code.replace(styleTagRe, '<style$1lang="postcss" transformed$2>') }
  }
  return code
}
