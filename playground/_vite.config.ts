import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Vue from '@vitejs/plugin-vue'
import { resolve } from 'pathe'
import Unplugin from '../src/vite'

export default defineConfig({
  logLevel: 'info',
  resolve: {
    alias: {
      pinceau: resolve(__dirname, '../src/index.ts'),
    },
  },
  plugins: [
    Inspect(),
    Unplugin({
      configFileName: 'tokens.config',
      configOrPaths: [
        resolve(__dirname, 'theme'),
      ],
    }),
    Vue(),
  ],
})
