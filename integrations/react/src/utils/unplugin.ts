import { getPinceauContext, transform, transformInclude } from '@pinceau/core/utils'
import type { PinceauContext } from '@pinceau/core'
import { createUnplugin } from 'unplugin'
import type { UnpluginInstance } from 'unplugin'
import { suite } from '../transforms/suite'
import { registerVirtualOutputs } from './virtual'

export const PinceauReactPlugin: UnpluginInstance<undefined> = createUnplugin(() => {
  let ctx: PinceauContext

  return {
    name: 'pinceau:jsx-plugin',

    enforce: 'pre',

    vite: {
      async configResolved(config) {
        ctx = getPinceauContext(config)

        registerVirtualOutputs(ctx)

        ctx.addTypes({
          imports: [
            'import type { StyledComponentFactory as ReactStyledComponentFactory } from \'@pinceau/react\'',
          ],
          global: [
            'export const $styled: { [Type in SupportedHTMLElements]: ReactStyledComponentFactory<Type> }',
          ],
          raw: [
          ],
        })
      },
    },

    transformInclude: id => transformInclude(id, ctx),

    transform: async (code, id) => {
      const result = await transform(code, id, suite, ctx)

      return result
    },
  }
})
