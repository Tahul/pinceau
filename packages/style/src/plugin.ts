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

        ctx.registerOutput(
          '$pinceau/css-functions',
          '/__pinceau_css_functions.css',
          '/* test */',
        )
      },
    },

    transformInclude: id => transformInclude(id, ctx),

    transform: (code, id) => transform(code, id, suite, ctx),
  }
})

export default PinceauStylePlugin
