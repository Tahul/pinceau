import path from 'node:path'
import fs from 'node:fs'
import { createResolver } from '@nuxt/kit'
import { defineConfig } from 'vite'
import Pinceau from '../../integrations/pinceau/src/plugin'
import { getPinceauContext } from '../../packages/core/src/utils'
import { createReactPlugin } from '../../integrations/react/src/utils'
import { createVuePlugin } from '../../integrations/vue/src/utils'
import { createSveltePlugin } from '../../integrations/svelte/src/utils'
import type { PinceauContext } from '../../packages/core/src'

let ctx: PinceauContext

const { resolve } = createResolver(import.meta.url)

export default defineConfig({
  plugins: [
    Pinceau({
      debug: 2,
      dev: false,
      theme: {
        buildDir: path.join(__dirname, './output/'),
      },
    }),
    {
      name: 'post',
      configResolved(config) {
        ctx = getPinceauContext(config)
      },
      buildEnd() {
        const plugins = {
          'react-plugin.js': createReactPlugin(ctx),
          'vue-plugin.js': createVuePlugin(ctx),
          'svelte-plugin.js': createSveltePlugin(ctx),
        }

        for (const [plugin, file] of Object.entries(plugins)) {
          fs.writeFileSync(
            resolve(`./output/${plugin}`),
            file,
          )
        }
      },
    },
  ],
})
