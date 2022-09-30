import { resolve } from 'path'
import PinceauModule from '../../../src/nuxt'

export default defineNuxtConfig({
  extends: [resolve(__dirname, '../shared')],
  modules: [PinceauModule],
  alias: {
    'pinceau/runtime': resolve(__dirname, '../../../src/runtime.ts'),
    'pinceau': resolve(__dirname, '../../../src/index.ts'),
  },
  pinceau: {
    configFileName: 'tokens.config',
    followSymbolicLinks: false,
  },
  pages: true,
  dir: {
    pages: resolve(__dirname, '../shared/pages'),
  },
  vite: {
    vue: {
      reactivityTransform: true,
    },
  },
})
