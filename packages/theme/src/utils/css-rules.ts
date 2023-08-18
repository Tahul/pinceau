import type { ColorSchemeModes, PinceauMediaQueries } from '../types'

/**
 * Resolve a responsive selector for a set media query, a color scheme mode and a theme.
 */
export function resolveMediaSelector(
  {
    mq,
    colorSchemeMode,
    theme = {},
  }: {
    mq: string
    colorSchemeMode: ColorSchemeModes
    theme: Record<string, any>
  },
) {
  let selector = ''
  if (mq === 'dark' || mq === 'light') {
    if (colorSchemeMode === 'class') { selector = `:root.${mq}` }
    else { selector = `(prefers-color-scheme: ${mq})` }
  }
  else if (mq !== 'initial' && theme) {
    const queryToken = theme?.media?.[mq]
    if (queryToken) { selector = queryToken.value }
  }
  return selector
}

/**
 * Get a rule prefix from a responsive selector.
 */
export function resolveReponsiveSelectorPrefix(selector: string) {
  let prefix: string
  if (!selector) { prefix = '@media { :root {' }
  else if (selector.startsWith('.')) { prefix = `@media { :root${selector} {` }
  else if (selector.startsWith(':root')) { prefix = `@media { ${selector} {` }
  else { prefix = `@media ${selector} { :root {` }
  return prefix
}

/**
 * Return a theme rule from a media query key, some content and a theme.
 */
export function createThemeRule(
  {
    content,
    mq,
    colorSchemeMode,
    theme,
  }: {
    content: string
    mq: PinceauMediaQueries
    colorSchemeMode: ColorSchemeModes
    theme: Record<string, any>
  },
) {
  const responsiveSelector = resolveMediaSelector({ mq, colorSchemeMode, theme })

  const prefix = resolveReponsiveSelectorPrefix(responsiveSelector)

  return `${`${prefix}--pinceau-mq: ${String(mq)}; ${content}`} } }\n`
}
