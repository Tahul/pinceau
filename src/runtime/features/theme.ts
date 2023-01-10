import { computed, ref } from 'vue'
import type { PermissiveConfigType, PinceauTheme, PinceauTokensPaths, TokensFunctionOptions } from '../../types'
import { get, normalizeConfig, set, walkTokens } from '../../utils/data'
import { pathToVarName } from '../../utils/$tokens'
import { responsiveMediaQueryRegex } from '../../utils/regexes'
import { resolveReferences } from '../../utils/css'
import { createTokensHelper } from '../utils'

export function usePinceauThemeSheet(
  initialTheme: any,
  tokensHelperConfig = {},
) {
  // Local theme stylesheet reference.
  const sheet = ref<CSSStyleSheet>()

  // Resolved theme object from the stylesheet.
  const theme = ref<any>(initialTheme || {})

  // Create $tokens helper
  tokensHelperConfig = Object.assign(
    {
      key: 'variable',
    },
    tokensHelperConfig || {},
  ) as TokensFunctionOptions
  const $tokens = createTokensHelper(
    theme,
    tokensHelperConfig,
  )

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
   * Fallback resolver for the local theme sheet.
   *
   * Will be used if the `#pinceau-theme` sheet cannot be found via its id.
   */
  function findThemeSheet(document: Document): HTMLStyleElement {
    for (const sheet of document.styleSheets) {
      if (sheet?.ownerNode?.textContent.includes('--pinceau-mq')) {
        return sheet.ownerNode as HTMLStyleElement
      }
    }
  }

  /**
   * Resolve the theme stylesheet.
   */
  function resolveStylesheet() {
    // Only update stylesheet on client-side
    // SSR Rendering occurs in `app:rendered` hook, or via `getStylesheetContent`
    const global = globalThis || window

    if (global && global.document) {
      // Find local sheet with `#pinceau-theme` id
      let sheetElement = document.querySelector('#pinceau-theme') as HTMLStyleElement

      // Fallback resolve theme sheet by iterating on document sheets
      if (!sheetElement) { sheetElement = findThemeSheet(document) }

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
          let currentTheme = 'initial'

          // Regex-based hydration
          rule.cssText
            .match(/--([\w-]+)\s*:\s*(.+?);/gm)
            ?.forEach((match) => {
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
              set(theme.value, path, getSetValue(path, value, variable, currentTheme))
            })
        },
      )
  }

  /**
   * Update existing theme keys with a partial config object.
   */
  function updateTheme(value: PermissiveConfigType<PinceauTheme>) {
    // Media queries keys extracted from current theme object and new one
    const mqKeys = Array.from(new Set(['dark', 'light', ...Object.keys((value as any)?.media || {}), ...Object.keys(theme.value?.media || {})]))

    // Turn partial configuration object into a valid design tokens configuration object
    const config = normalizeConfig(value || {}, mqKeys, true)

    // Walk tokens inside partial theme object and assign them to local stylesheet
    walkTokens(config, (token, _, paths) => updateToken(paths, token.value))
  }

  /**
   * Update a specific token from its variable and a value.
   */
  function updateToken(path: string | string[], value, mq = 'initial') {
    // Handle `mq` object passed as value
    if (typeof value === 'object') {
      Object.entries(value).forEach(([mq, mqValue]) => updateToken(path, mqValue, mq))
      return
    }

    // Cast any type of path into a var name
    const varName = pathToVarName(path)

    // Create missing rules
    if (!cache?.[mq]) { createMqRule(mq) }

    // Resolve value if it contains references
    const resolvedValue = resolveReferences(undefined, value, { $tokens } as any)

    // Set value in theme object
    set(
      theme.value,
      path,
      getSetValue(path, resolvedValue, varName, mq),
    )

    // Set CSS variable value
    cache?.[mq]?.style.setProperty(varName, resolvedValue)
  }

  /**
   * Returns a writeable computed that will reactively update a token value accross all references when updated.
   */
  function reactiveToken(path: PinceauTokensPaths | ({} & string)) {
    return computed(
      {
        get() {
          return get(theme.value, `${path}.value`)
        },
        set(v: string | { [k: string]: string }) {
          updateToken(path, v)
        },
      },
    )
  }

  /**
   * Return a token value from a path and a new value
   */
  function getSetValue(path: string | string[], value, variable, mq = 'initial') {
    const varRef = `var(${variable})`
    const setValue = { value, variable: varRef }
    const existingValue = get(theme.value, path)
    if (existingValue) {
      if (typeof existingValue?.value === 'object') { setValue.value = { ...existingValue.value, [mq]: value } }
      else { setValue.value = { initial: existingValue.value, [mq]: value } }
    }
    return setValue
  }

  /**
   * Creates a cached rule for media a specific media query.
   */
  function createMqRule(mq: string) {
    // Skip already existing rules
    if (cache?.[mq]) { return cache?.[mq] }

    let mqValue: string
    if (mq === 'dark' || mq === 'light') {
      mqValue = `:root.${mq}`
    }
    else {
      mqValue = theme.value?.media?.[mq]?.value
    }

    let css
    if (mqValue.match(responsiveMediaQueryRegex)) {
      // Use raw selector
      css = `@media { ${mqValue} { --pinceau-mq: ${mq}; } }`
    }
    else {
      // Wrap :root with media query
      css = `@media ${mqValue} { :root { --pinceau-mq: ${mq}; } }`
    }

    // Assign the `:root` rule as cache
    cache[mq] = (sheet.value.cssRules.item(sheet.value.insertRule(css, sheet.value.cssRules.length)) as CSSMediaRule).cssRules[0]

    return cache[mq]
  }

  return {
    $tokens,
    updateToken,
    updateTheme,
    reactiveToken,
    resolveStylesheet,
    theme,
  }
}
