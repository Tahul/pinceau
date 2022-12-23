import { computed, ref } from 'vue'
import type { PermissiveConfigType, PinceauTheme } from '../../types'
import { get, normalizeConfig, set, walkTokens } from '../../utils/data'
import { deepAssign, deepDelete } from '../../utils/deep'
import { pathToVarName } from '../../utils/$tokens'

/**
 * Find a sheet containing a particular CSS variable.
 */
function findParentSheet(document, search) {
  // Get all of the stylesheets in the document
  const stylesheets = document.styleSheets

  // Iterate through the stylesheets
  for (let i = 0; i < stylesheets.length; i++) {
    const stylesheet = stylesheets[i]
    if (stylesheet?.ownerNode?.innerHTML?.includes(search)) { return stylesheet }
  }

  // If the CSS text is not present in any stylesheets, return null
  return null
}

export function usePinceauThemeSheet(
  initialTheme: any,
) {
  // Local theme stylesheet reference.
  const sheet = ref<CSSStyleSheet>()

  // Resolved theme object from the stylesheet.
  const theme = ref<any>(initialTheme || {})

  // Local cache for each token CSSRule index.
  const cache = {}

  // Resolve stylesheet on boot
  resolveStylesheet()

  // Handle dev HMR
  if (import.meta.hot) {
    // Deep update theme from new definition
    import.meta.hot.on(
      'pinceau:themeUpdate',
      (newTheme) => {
        deepAssign(theme.value, newTheme.theme)
        deepDelete(theme.value, newTheme.theme)
      },
    )
    // Update local stylesheet reference
    import.meta.hot.on('vite:afterUpdate', ({ updates }) => (updates[0]?.path?.includes('/__pinceau_css.css') || updates[0]?.path?.includes('pinceau.css')) && resolveStylesheet())
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
      const sheetElement = findParentSheet(global.document, '.pinceau-theme[--]')

      // Assign local sheet reference
      sheet.value = sheetElement

      // Hydrate theme object with resolved sheet
      hydrateStylesheet(sheetElement?.cssRules)
    }
  }

  /**
   * Hydrate theme object from a CSSRuleList object coming from the theme stylesheet.
   */
  function hydrateStylesheet(cssRules: any) {
    // Hydrate cache with resolved values from sheet
    Object
      .entries(cssRules || {})
      .filter(([_, rule]: any) => {
        if (rule?.selectorText === '.pinceau-theme[--]') { return false }
        if (rule?.type !== 4 && !rule?.cssText?.includes('--pinceau-mq')) { return false }
        return true
      })
      .forEach(
        ([_, rule]: any) => {
          let currentTheme = 'root'

          rule
            .cssText
            .match(/--([\w-]+)\s*:\s*(.+?);/gm)
            .map((matchedRule) => {
              const rule = matchedRule.replace(';', '').split(': ')
              if (rule[0] === '--pinceau-mq') { currentTheme = rule[1] }
              return rule
            })
            .forEach(([key, value]: any) => setThemeValue(key, value, currentTheme))
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

    // Deeply assign new keys from partial config object
    deepAssign(theme.value, config)

    // Walk tokens inside partial theme object and assign them to local stylesheet
    walkTokens(config, (value, _, paths) => updateVariable(pathToVarName(paths.join('.')), value.value))
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
    // Find cached rule reference corresponding to the CSS variable
    const cachedValue = cache[`--${variable}`]
    // No cached value found
    // TODO: Create new value if not found?
    if (!cachedValue) { return }
    // Handle `mq` object passed as value
    if (typeof value === 'object') { Object.entries(value).forEach(([mq, mqValue]) => cachedValue?.[mq]?.setProperty(`--${pathToVarName(variable)}`, mqValue)) }
    // Handle flat value
    else { cachedValue?.root?.setProperty(`--${pathToVarName(variable)}`, value) }
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
