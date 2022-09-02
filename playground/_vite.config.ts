import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Vue from '@vitejs/plugin-vue'
import Unplugin from '../src/vite'

export default defineConfig({
  logLevel: 'info',
  plugins: [
    Inspect(),
    Unplugin({
      configOrPaths: [
        './',
        './theme',
      ],
    }),
    Vue(),
  ],
  resolve: {
    alias: {
      pinceau: '../src/index.ts',
    },
  },
  optimizeDeps: {
    exclude: ['fsevents'],
  },
})
