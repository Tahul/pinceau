import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pinceau from 'pinceau'
import Inspect from 'vite-plugin-inspect'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@pinceau/vue/runtime': '../../packages/vue/src/runtime.ts',
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
