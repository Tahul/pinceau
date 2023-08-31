import { createUnplugin } from 'unplugin'
import type { UnpluginInstance } from 'unplugin'

// import { getPinceauContext } from '@pinceau/core/utils'
// import type { PinceauContext } from '@pinceau/core'

const PinceauRuntimePlugin: UnpluginInstance<undefined> = createUnplugin(() => {
  // let ctx: PinceauContext

  return {
    name: 'pinceau:runtime-plugin',

    enforce: 'pre',

    vite: {
      async configResolved(_config) {
        // ctx = getPinceauContext(config)
      },
    },
  }
})

export default PinceauRuntimePlugin
