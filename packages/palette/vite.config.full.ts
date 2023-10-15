import path from 'node:path'
import fs from 'node:fs'
import { createResolver } from '@nuxt/kit'
import { defineConfig } from 'vite'
import Pinceau from 'pinceau/plugin'
import { getPinceauContext } from '@pinceau/core/utils'
import { createReactPlugin } from '@pinceau/react/utils'
import { createVuePlugin } from '@pinceau/vue/utils'
import { createSveltePlugin } from '@pinceau/svelte/utils'
import type { PinceauContext } from '@pinceau/core'

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
