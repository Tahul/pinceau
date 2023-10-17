import { getPinceauContext, transform, transformInclude } from '@pinceau/core/utils'
import type { PinceauContext } from '@pinceau/core'
import { createUnplugin } from 'unplugin'
import type { UnpluginInstance } from 'unplugin'
import { suite } from './transforms/suite'
import { PinceauSvelteTransformer } from './utils/transformer'
import { registerVirtualOutputs } from './utils/virtual'

export { registerVirtualOutputs }

export const PinceauSveltePlugin: UnpluginInstance<undefined> = createUnplugin(() => {
  let ctx: PinceauContext

  return {
    name: 'pinceau:svelte-plugin',

    enforce: 'pre',

    vite: {
      async configResolved(config) {
        ctx = getPinceauContext(config)

        ctx.registerTransformer(
          'svelte',
          PinceauSvelteTransformer,
        )

        ctx.addTypes({
          imports: [
            'import \'svelte/elements\'',
            'import type { SvelteStyledComponentFactory } from \'@pinceau/svelte\'',
            'import { ResponsiveProp } from \'@pinceau/style\'',
            'import { StyledFunctionArg } from \'@pinceau/style\'',
          ],
          global: [
            'export type ResponsiveProp<T extends string | number | symbol | undefined> = ResponsiveProp<T>',
            'export type StyledProp = StyledFunctionArg',
            'export const $styled: { [Type in SupportedHTMLElements]: SvelteStyledComponentFactory<Type> }',
          ],
          raw: [
            'declare module \'svelte/elements\' { export interface DOMAttributes<T extends EventTarget> { styled?: StyledFunctionArg } }',
          ],
        })

        registerVirtualOutputs(ctx)
      },
    },

    transformInclude: id => transformInclude(id, ctx),

    transform: async (code, id) => {
      const query = ctx.transformed[id]

      if (query.sfc === 'svelte') { return await transform(code, id, suite, ctx) }
    },
  }
})
