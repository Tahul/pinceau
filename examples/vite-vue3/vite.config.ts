import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Inspect from 'vite-plugin-inspect'
import Pinceau from 'pinceau/plugin'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@pinceau/stringify': '../../packages/stringify/src/index.ts',
      '@pinceau/runtime': '../../packages/runtime/src/index.ts',
      '@pinceau/vue/runtime': '../../packages/vue/src/runtime.ts',
      '@pinceau/core/runtime': '../../packages/core/src/runtime.ts',
      '@pinceau/theme/runtime': '../../packages/theme/src/runtime.ts',
    },
  },
  plugins: [
    Vue(),
    Pinceau({
      debug: 2,
      vue: true,
      runtime: true,
    }),
    Inspect({
      build: true,
      outputDir: '.vite-inspect',
    }),
  ],
})
