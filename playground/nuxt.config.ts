import { resolve } from 'path'

export default defineNuxtConfig({
  extends: [resolve(__dirname, './theme')],
  modules: ['../src/nuxt.ts', '@nuxtjs/color-mode'/* , '@nuxt/content' */],
  alias: {
    'pinceau/runtime': resolve(__dirname, '../src/runtime.ts'),
    'pinceau': resolve(__dirname, '../src/index.ts'),
  },
  pinceau: {
    configFileName: 'tokens.config',
    debug: 2,
  },
  hooks: {
    'pinceau:options': (options) => {
      return options
    },
  },
  vite: {
    vue: {
      reactivityTransform: true,
    },
  },
  colorMode: {
    classSuffix: '',
  },
  typescript: {
    includeWorkspace: true,
  },
})
