import type { PinceauRuntimeSheet, PinceauRuntimeSheetOptions } from '../types'
import { IS_BROWSER } from './constants'
import { useStyleSheet } from './sheet'

export const defaultRuntimeSheetOptions: PinceauRuntimeSheetOptions = {
  hydrate: IS_BROWSER,
}

export function useRuntimeSheet(options?: PinceauRuntimeSheetOptions): PinceauRuntimeSheet {
  console.time('useRuntimeSheet')

  options = { ...defaultRuntimeSheetOptions, ...(options || {}) }

  const sheet = useStyleSheet('pinceau-runtime', IS_BROWSER ? document : undefined)

  const cache: { [key: string]: CSSMediaRule } = {}

  const hydrate = () => {
    console.time('hydrateRuntimeSheet')

    console.timeEnd('hydrateRuntimeSheet')
  }

  if (options?.hydrate) { hydrate() }

  /**
   * Stringify the stylesheet; to be used from SSR context.
   */
  function toString() {
    if (!sheet) { return '' }
    return Object.entries(sheet.cssRules).reduce(
      (acc, [, rule]: any) => {
        acc += `${rule?.cssText} ` || ''
        return acc
      },
      '',
    )
  }

  console.timeEnd('useRuntimeSheet')

  return {
    sheet,
    cache,
    hydrate,
    toString,
  }
}
