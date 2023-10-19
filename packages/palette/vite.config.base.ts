import fs from 'node:fs'
import path from 'node:path'
import { createResolver } from '@nuxt/kit'
import { defineConfig } from 'vite'
import type { ResolvedConfig } from 'vite'
import Pinceau from 'pinceau/plugin'
import { getPinceauContext } from '@pinceau/core/utils'
import { createSveltePlugin } from '@pinceau/svelte/utils'
import { createReactPlugin } from '@pinceau/react/utils'
import { createVuePlugin } from '@pinceau/vue/utils'
import { configSourceFromModulePath } from '@pinceau/theme/utils'

const resolve = createResolver(import.meta.url).resolve

let config: ResolvedConfig

export default defineConfig({
  resolve: {
    alias: {
      '@pinceau/theme': resolve('../theme/src/index.ts'),
      '@pinceau/theme/utils': resolve('../theme/src/utils.ts'),
      '@pinceau/core': resolve('../core/src/index.ts'),
      '@pinceau/core/utils': resolve('../core/src/utils.ts'),
      '@pinceau/integration': resolve('../integration/src/index.ts'),
    },
  },
  plugins: [
    Pinceau({
      debug: 2,
      dev: false,
      theme: {
        buildDir: path.join(__dirname, '../outputs/'),
      },
    }),
    {
      name: '@pinceau/palette-end',
      configResolved(_config) {
        config = _config
      },
      buildEnd() {
        const ctx = getPinceauContext(config)

        const plugins = {
          svelte: createSveltePlugin,
          react: createReactPlugin,
          vue: createVuePlugin,
        }

        const outputsPath = configSourceFromModulePath('@pinceau/outputs', ctx)?.path

        Object.entries(plugins).forEach(([key, plugin]) => {
          const pluginContent = plugin(ctx)

          if (outputsPath) {
            fs.writeFileSync(
              path.join(outputsPath, `${key}-plugin.js`),
              pluginContent,
            )
          }
        })
      },
    },
  ],
})
