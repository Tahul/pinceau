import { createResolver } from '@nuxt/kit'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Inspect from 'vite-plugin-inspect'
import { Pinceau } from 'pinceau/plugin'

const resolve = (p: string) => createResolver(import.meta.url).resolve(p)

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@pinceau/stringify': resolve('../../packages/stringify/src/index.ts'),
      '@pinceau/runtime': resolve('../../packages/runtime/src/index.ts'),
      '@pinceau/vue/runtime': resolve('../../packages/vue/src/runtime.ts'),
      '@pinceau/core/runtime': resolve('../../packages/core/src/runtime.ts'),
      '@pinceau/theme/runtime': resolve('../../packages/theme/src/runtime.ts'),
    },
  },
  plugins: [
    Vue(),
    Pinceau({
      debug: 2,
      style: {
        excludes: [
          resolve('../../packages'),
        ],
      },
      theme: {
        layers: [
          {
            path: resolve('../../packages/palette/'),
          }
        ]
      }
    }),
    !process.env.VITEST_WORKER_ID ? Inspect({
      build: true,
      outputDir: '.vite-inspect',
    }) : undefined,
  ],
})
