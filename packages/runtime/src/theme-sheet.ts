import type { PinceauMediaQueries, PinceauTheme, Theme } from '@pinceau/theme'
import { createThemeRule, normalizeTokens, walkTokens } from '@pinceau/theme/runtime'
import { createTokensHelper, get, pathToVarName, set } from '@pinceau/core/runtime'
import { resolveReferences } from '@pinceau/stringify'
import type { PinceauRuntimePluginOptions, PinceauThemeSheet } from './types'

export function useThemeSheet({ colorSchemeMode, theme: initialTheme = {} }: PinceauRuntimePluginOptions): PinceauThemeSheet {
  // Local theme stylesheet reference.
  let sheet: CSSStyleSheet | undefined

  // Resolved theme object from the stylesheet.
  const theme = initialTheme || {}

  // Create $tokens helper for local referencing.
  const $tokens = createTokensHelper(theme)

  // Local cache for each mq CSSRules.
  let cache: { [key: string]: any } = {}

  // Resolve stylesheet on boot
  resolveStylesheet()

  /**
   * Resolve the theme stylesheet.
   */
  function resolveStylesheet() {
    // Only update stylesheet on client-side
    // SSR Rendering occurs in `app:rendered` hook, or via `getStylesheetContent`
    const global = globalThis || window

    if (global && global.document) {
      // Find local sheet with `#pinceau-theme` id
      let sheetElement: HTMLStyleElement | undefined = document.querySelector('#pinceau-theme') as HTMLStyleElement || undefined

      // Fallback resolve theme sheet by iterating on document sheets
      if (!sheetElement) { sheetElement = findThemeSheet(document) }

      // Assign local sheet reference
      sheet = sheetElement?.sheet || undefined

      // Hydrate theme object with resolved sheet
      if (sheet) { hydrateStylesheet(sheet?.cssRules) }
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
          let currentTheme = 'initial'

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
                  if (ruleReference) { cache[value] = ruleReference as CSSStyleRule }
                }
                return
              }

              // Reformat variable
              const path = [...variable.substring(2).split('-')]
              set(theme, path, getSetValue(path, value, variable, currentTheme))
            })
        },
      )
  }

  /**
   * Update existing theme keys with a partial config object.
   */
  function updateTheme(value: Theme<PinceauTheme>) {
    // Media queries keys extracted from current theme object and new one
    const mqKeys = Array.from(new Set(['dark', 'light', ...Object.keys((value as any)?.media || {}), ...Object.keys(theme?.media || {})]))

    // Turn partial configuration object into a valid design tokens configuration object
    const config = normalizeTokens(value, mqKeys, true)

    // Walk tokens inside partial theme object and assign them to local stylesheet
    walkTokens(config, (token, _, paths) => updateToken(paths, token))
  }

  /**
   * Update a specific token from its variable and a value.
   */
  function updateToken(path: string | string[], value: any, mq: PinceauMediaQueries = 'initial') {
    // Handle `mq` object passed as value
    if (typeof value === 'object') {
      Object.entries(value).forEach(([mq, mqValue]) => updateToken(path, mqValue, mq as PinceauMediaQueries))
      return
    }

    // Cast any type of path into a var name
    const varName = pathToVarName(path)

    // Create missing rules
    if (!cache?.[mq]) { createMqRule(mq) }

    // Resolve value if it contains references
    const resolvedValue = resolveReferences(value, { $tokens } as any)

    // Set value in theme object
    set(
      theme,
      path,
      getSetValue(path, resolvedValue, varName, mq),
    )

    // Set CSS variable value
    cache?.[mq]?.style.setProperty(varName, resolvedValue)
  }

  /**
   * Return a token value from a path and a new value
   */
  function getSetValue(path: string | string[], value: any, variable: string, mq = 'initial') {
    const setValue = { value, variable: `var(${variable})` }

    const existingValue = get(theme, path)

    if (existingValue && !variable.startsWith('--media')) {
      if (typeof existingValue?.value === 'object') { setValue.value = { ...existingValue, [mq]: value } }
      else { setValue.value = { initial: existingValue, [mq]: value } }
    }

    return setValue
  }

  /**
   * Creates a cached rule for media a specific media query.
   */
  function createMqRule(mq: PinceauMediaQueries) {
    if (!sheet) { return }

    // Skip already existing rules
    if (cache?.[mq]) { return cache?.[mq] }

    // Create a media query theme rule
    const mqRule = createThemeRule({ mq, content: '', theme, colorSchemeMode })

    // Assign the `:root` rule as cache
    const newRule = sheet.insertRule(mqRule, sheet.cssRules.length)
    cache[mq] = (sheet.cssRules.item(newRule) as CSSMediaRule).cssRules[0]

    return cache[mq]
  }

  // Handle dev HMR
  if (import.meta.hot) {
    // Deep update theme from new definition
    import.meta.hot.on(
      'pinceau:theme',
      () => {
        if (!sheet) { return }
        // Resolve stylesheet
        hydrateStylesheet(sheet.cssRules)
      },
    )
  }

  return {
    $tokens,
    updateToken,
    updateTheme,
    resolveStylesheet,
    theme,
  }
}

/**
 * Fallback resolver for the local theme sheet.
 *
 * Will be used if the `#pinceau-theme` sheet cannot be found via its id.
 */
function findThemeSheet(document: Document): HTMLStyleElement | undefined {
  let result: HTMLStyleElement | undefined

  // @ts-ignore
  for (const sheet of document.styleSheets) {
    if (sheet?.ownerNode?.textContent.includes('--pinceau-mq')) {
      result = sheet.ownerNode as HTMLStyleElement
      return result
    }
  }

  return result
}
