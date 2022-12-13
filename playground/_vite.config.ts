import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Vue from '@vitejs/plugin-vue'
import { resolve } from 'pathe'
import Pinceau from '../src/vite'

const from = 'src'
const ext = '.ts'

export default defineConfig({
  logLevel: 'info',
  resolve: {
    alias: {
      'pinceau/runtime': resolve(__dirname, `../${from}/runtime${ext}`),
      'pinceau': resolve(__dirname, `../${from}/index${ext}`),
    },
  },
  plugins: [
    Inspect(),
    Pinceau({
      configFileName: 'tokens.config',
      configOrPaths: [
        resolve(__dirname, 'theme'),
      ],
      debug: 2,
      colorSchemeMode: 'class',
    }),
    Vue(),
  ],
})
