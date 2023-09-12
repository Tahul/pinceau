import type { DesignToken } from '@pinceau/theme'
import { createThemeHelper, get, set } from '@pinceau/core/runtime'
import type { PinceauThemeSheet, PinceauThemeSheetOptions } from '../types'
import { useStyleSheet } from './sheet'
import { IS_BROWSER } from './constants'

export const defaultThemeSheetOptions: PinceauThemeSheetOptions = {
  theme: {},
  hydrate: IS_BROWSER,
}

export function useThemeSheet(options?: PinceauThemeSheetOptions): PinceauThemeSheet {
  options = { ...defaultThemeSheetOptions, ...(options || {}) }

  const sheet = useStyleSheet('pinceau-theme', IS_BROWSER ? document : undefined)

  // Resolved theme object from the stylesheet.
  const theme = Object.assign({}, options?.theme || {})

  // Local cache for each mq CSSRules.
  let cache: { [key: string]: CSSMediaRule } = {}

  /**
   * Hydrate theme object from a CSSRuleList object coming from the theme stylesheet.
   */
  function hydrate(cssRules: CSSRuleList = sheet?.cssRules || {}) {
    // Reset cache on hydration
    cache = {}

    // Hydrate cache with resolved values from sheet
    Object
      .entries(cssRules || {})
      .forEach(
        ([_, rule]: any) => {
          // Filter
          if (rule?.type !== 4 && !rule?.cssText?.includes('--pinceau-mq')) { return false }

          // Get current theme from parsed cssRules
          let currentTheme = '$initial'

          // Regex-based hydration
          rule.cssText
            .match(/--([\w-]+)\s*:\s*(.+?);/gm)
            ?.forEach((match: string) => {
              const [variable, value] = match.replace(';', '').split(/:\s(.*)/s)

              // Support responsive tokens
              if (variable === '--pinceau-mq') {
                currentTheme = value
                // Assign cache rule references
                if (!cache[value]) {
                  const ruleReference = (Object.entries(rule?.cssRules || {}).find(([_, cssRule]: any) => cssRule?.cssText.includes(`--pinceau-mq: ${value}`)))?.[1]
                  if (ruleReference) { cache[value] = ruleReference as CSSMediaRule }
                }
                return
              }

              // Reformat variable
              const path = [...variable.substring(2).split('-')]
              set(theme, path, formatToken(path, value, variable, currentTheme))
            })
        },
      )
  }
  if (options?.hydrate) { hydrate() }

  /**
   * Return a token value from a path and a new value
   */
  function formatToken(
    path: string | string[],
    value: any,
    variable: string,
    mq = '$initial',
  ) {
    const setValue = { value, variable: `var(${variable})` }

    const existingValue = get(theme, path) as DesignToken | undefined

    // Media queries do not support responsive tokens, stop here
    if (variable.startsWith('--media')) { return setValue }

    // Support responsive tokens
    if (existingValue || mq !== '$initial') {
      if (typeof existingValue?.value === 'object') { setValue.value = { ...existingValue, [mq]: value } }
      else { setValue.value = { $initial: existingValue?.value, [mq]: value } }
    }

    return setValue
  }

  return {
    sheet,
    theme,
    get $theme() { return createThemeHelper(theme) },
    cache,
    hydrate,
    formatToken,
  }
}
