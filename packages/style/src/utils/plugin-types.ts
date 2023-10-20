export const pluginTypes = {
  imports: [
    'import type { StyledComponentFactory } from \'@pinceau/style\'',
    'import type { SupportedHTMLElements } from \'@pinceau/style\'',
    'import type { CSSFunctionArg } from \'@pinceau/style\'',
    'import type { StyledFunctionArg } from \'@pinceau/style\'',
    'import type { ThemeTokens } from \'@pinceau/style\'',
  ],
  global: [
    // css({ ... })
    'export const css: ((declaration: CSSFunctionArg) => string)',
    // styled({ ... }) & styled.a({ ... })
    'export const styled: (<Props extends {} = {}>(declaration: StyledFunctionArg<Props>) => string)',
    // Theme tokens helper
    'export type ThemeTokens<T extends PinceauThemePaths & (string & {}) = PinceauThemePaths & (string & {})> = PinceauThemeTokens<T>',
  ],
}
