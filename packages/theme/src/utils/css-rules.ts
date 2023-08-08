import type { ColorSchemeModes, PinceauMediaQueries } from '../types'

/**
 * Resolve a responsive selector for a set media query, a color scheme mode and a theme.
 */
export function resolveResponsiveSelector(
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
  let responsiveSelector = ''
  if (mq === 'dark' || mq === 'light') {
    if (colorSchemeMode === 'class') { responsiveSelector = `:root.${mq}` }
    else { responsiveSelector = `(prefers-color-scheme: ${mq})` }
  }
  else if (mq !== 'initial' && theme) {
    const queryToken = theme?.media?.[mq]
    if (queryToken) { responsiveSelector = queryToken.value }
  }
  return responsiveSelector
}

/**
 * Get a rule prefix from a responsive selector.
 */
export function resolveReponsiveSelectorPrefix(
  responsiveSelector: string,
) {
  let prefix: string
  if (!responsiveSelector) { prefix = '@media { :root {' }
  else if (responsiveSelector.startsWith('.')) { prefix = `@media { :root${responsiveSelector} {` }
  else if (responsiveSelector.startsWith(':root')) { prefix = `@media { ${responsiveSelector} {` }
  else { prefix = `@media ${responsiveSelector} { :root {` }
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
  const responsiveSelector = resolveResponsiveSelector({ mq, colorSchemeMode, theme })

  const prefix = resolveReponsiveSelectorPrefix(responsiveSelector)

  return `${`${prefix}--pinceau-mq: ${String(mq)}; ${content}`} } }\n`
}
