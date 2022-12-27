import { computed, ref } from 'vue'
import type { PermissiveConfigType, PinceauTheme } from '../../types'
import { get, normalizeConfig, set, walkTokens } from '../../utils/data'
import { pathToVarName } from '../../utils/$tokens'

export function usePinceauThemeSheet(
  initialTheme: any,
) {
  // Local theme stylesheet reference.
  const sheet = ref<CSSStyleSheet>()

  // Resolved theme object from the stylesheet.
  const theme = ref<any>(initialTheme || {})

  // Local cache for each mq CSSRules.
  let cache: { [key: string]: any } = {}

  // Resolve stylesheet on boot
  resolveStylesheet()

  // Handle dev HMR
  if (import.meta.hot) {
    // Deep update theme from new definition
    import.meta.hot.on(
      'pinceau:themeUpdate',
      (newTheme) => {
        // Swap stylesheet
        const styleNode = document.createElement('style')
        styleNode.id = 'pinceau-theme'
        styleNode.textContent = newTheme.css
        sheet.value.ownerNode.replaceWith(styleNode)
        sheet.value = styleNode.sheet

        // Resolve stylesheet
        hydrateStylesheet(sheet.value.cssRules)
      },
    )
  }

  /**
   * Resolve the theme stylesheet.
   */
  function resolveStylesheet() {
    // Only update stylesheet on client-side
    // SSR Rendering occurs in `app:rendered` hook, or via `getStylesheetContent`
    const global = globalThis || window

    if (global && global.document) {
      // Find local sheet with `--pinceau-mq` variables
      const sheetElement = document.querySelector('#pinceau-theme') as HTMLStyleElement

      // Assign local sheet reference
      sheet.value = sheetElement?.sheet

      // Hydrate theme object with resolved sheet
      if (sheet.value) { hydrateStylesheet(sheet.value?.cssRules) }
    }
  }

  /**
   * Hydrate theme object from a CSSRuleList object coming from the theme stylesheet.
   */
  function hydrateStylesheet(cssRules: any) {
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
          let currentTheme = 'root'

          // Regex-based hydration
          rule.cssText
            .match(/--([\w-]+)\s*:\s*(.+?);/gm)
            .forEach((match) => {
              const [variable, value] = match.replace(';', '').split(/:\s(.*)/s)

              // Support responsive tokens
              if (variable === '--pinceau-mq') {
                currentTheme = value
                // Assign cache rule references
                if (!cache[value]) {
                  const ruleReference = (Object.entries(rule?.cssRules || {}).find(([_, cssRule]: any) => cssRule?.cssText.includes(`--pinceau-mq: ${value}`)))?.[1]
                  if (ruleReference) { cache[value] = ruleReference as CSSStyleRule }
                }
              }
              else {
                setThemeValue(variable, value, currentTheme)
              }
            })
        },
      )
  }

  /**
   * Update existing theme keys with a partial config object.
   */
  function updateTheme(value: PermissiveConfigType<PinceauTheme>) {
    // Media queries keys extracted from current theme object and new one
    const mqKeys = ['dark', 'light', ...Object.keys((value as any)?.media || {}), ...Object.keys(theme.value?.media || {})]

    // Turn partial configuration object into a valid design tokens configuration object
    const config = normalizeConfig(value || {}, mqKeys)

    // Walk tokens inside partial theme object and assign them to local stylesheet
    walkTokens(config, (value, _, paths) => {
      set(theme.value, paths, value)
      updateVariable(pathToVarName(paths.join('.')), value.value)
    })
  }

  /**
   * Set the theme value from a CSS var key and a CSSRule|string.
   */
  function setThemeValue(key: string, value: any, mediaQuery = 'root') {
    const path = [...key.substring(2).split('-')]
    const variable = `var(${key})`
    const existingValue = mediaQuery !== 'root' ? get(theme.value, path) : undefined
    if (existingValue?.value) { set(theme.value, path, { variable, value: { initial: existingValue.value, [mediaQuery]: value } }) }
    else { set(theme.value, path, { value, variable }) }
  }

  /**
   * Update a specific token from its variable and a value.
   */
  function updateVariable(variable, value) {
    // Handle `mq` object passed as value
    if (typeof value === 'object') { Object.entries(value).forEach(([mq, mqValue]) => cache?.[mq]?.style.setProperty(`--${pathToVarName(variable)}`, mqValue)) }
    // Handle flat value
    else { cache?.root?.style.setProperty(`--${pathToVarName(variable)}`, value) }
  }

  /**
   * Returns a writeable computed that will reactively update a token value accross all references when updated.
   */
  function reactiveToken(path: string) {
    const varName = pathToVarName(path)
    return computed(
      {
        get() {
          return get(theme.value, `${path}.value`)
        },
        set(v: string | { [k: string]: string }) {
          set(theme.value, `${path}.value`, v)
          updateVariable(varName, v)
        },
      },
    )
  }

  return {
    updateVariable,
    updateTheme,
    reactiveToken,
    setThemeValue,
    resolveStylesheet,
    theme,
  }
}
