import { getPinceauContext, transform, transformInclude } from '@pinceau/core/utils'
import type { PinceauContext } from '@pinceau/core'
import { createUnplugin } from 'unplugin'
import type { UnpluginInstance } from 'unplugin'
import { suite } from './transforms/suite'

const PinceauStylePlugin: UnpluginInstance<undefined> = createUnplugin(() => {
  let ctx: PinceauContext

  return {
    name: 'pinceau:style-plugin',

    enforce: 'pre',

    vite: {
      async configResolved(config) {
        ctx = getPinceauContext(config)

        ctx.addTypes({
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
        })
      },
    },

    transformInclude: id => transformInclude(id, ctx),

    transform: async (code, id) => await transform(code, id, suite, ctx),
  }
})

export default PinceauStylePlugin
