import { getPinceauContext, transform, transformInclude } from '@pinceau/core/utils'
import type { PinceauContext } from '@pinceau/core'
import { createUnplugin } from 'unplugin'
import type { UnpluginInstance } from 'unplugin'
import { suite } from '../transforms/suite'
import { registerVirtualOutputs } from './virtual'
import { PinceauVueTransformer } from './transformer'

export const PinceauVuePlugin: UnpluginInstance<undefined> = createUnplugin(() => {
  let ctx: PinceauContext

  return {
    name: 'pinceau:vue-plugin',

    enforce: 'pre',

    vite: {
      async configResolved(config) {
        ctx = getPinceauContext(config)

        ctx.registerTransformer(
          'vue',
          PinceauVueTransformer,
        )

        ctx.registerFilter(
          (ctx) => {
            // Skip `<script>` direct queries as they are made when components has already been transformed.
            // That step has already been processed by Pinceau's transforms.
            if (ctx.vueQuery && ctx.type === 'script') { return true }
          },
        )

        ctx.addTypes({
          imports: [
            'import type { StyledComponentFactory as VueStyledComponentFactory } from \'@pinceau/vue\'',
            'import { ResponsiveProp } from \'@pinceau/style\'',
            'import { StyledFunctionArg } from \'@pinceau/style\'',
            'import { PropType } from \'vue\'',
          ],
          global: [
            'export type ResponsiveProp<T extends string | number | symbol | undefined> = PropType<ResponsiveProp<T>>',
            'export type StyledProp = PropType<StyledFunctionArg>',
            'export const $styled: { [Type in SupportedHTMLElements]: VueStyledComponentFactory<Type> }',
          ],
          raw: [
            'declare module \'@vue/runtime-dom\' { interface HTMLAttributes { styled?: StyledFunctionArg } }',
          ],
        })

        registerVirtualOutputs(ctx)
      },
    },

    transformInclude: id => transformInclude(id, ctx),

    transform: async (code, id) => {
      const query = ctx.transformed[id]

      if (query.sfc === 'vue' || query.type === 'style') {
        return await transform(code, id, suite, ctx)
      }
    },
  }
})
