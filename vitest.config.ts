import Vue from '@vitejs/plugin-vue'
import { resolve } from 'pathe'
import { defineConfig } from 'vitest/config'
import Unplugin from './src/vite'

export default defineConfig({
  logLevel: 'info',
  resolve: {
    alias: {
      'pinceau/runtime': resolve(__dirname, './src/runtime.ts'),
      'pinceau': resolve(__dirname, './src/index.ts'),
    },
  },
  plugins: [
    Unplugin({
      configFileName: 'tokens.config',
      configOrPaths: [
        resolve(__dirname, '../theme'),
      ],
    }),
    Vue(),
  ],
  test: {
    globals: true,
    watch: true,
    environment: 'jsdom',
  },
})
