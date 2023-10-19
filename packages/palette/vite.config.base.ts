import path from 'node:path'
import { createResolver } from '@nuxt/kit'
import { defineConfig } from 'vite'
import Pinceau from 'pinceau/plugin'

const resolve = createResolver(import.meta.url).resolve

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
  ],
})
