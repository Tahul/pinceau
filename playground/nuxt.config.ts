import { resolve } from 'path'

export default defineNuxtConfig({
  extends: [resolve(__dirname, './theme')],
  modules: ['../src/nuxt.ts', '@nuxtjs/color-mode'],
  alias: {
    'pinceau/runtime': resolve(__dirname, '../src/runtime.ts'),
    'pinceau': resolve(__dirname, '../src/index.ts'),
  },
  pinceau: {
    configFileName: 'tokens.config',
  },
  hooks: {
    'pinceau:options': (options) => {
      return options
    },
  },
  experimental: {
    inlineSSRStyles: false,
  },
  vite: {
    vue: {
      reactivityTransform: true,
    },
  },
  colorMode: {
    classSuffix: '',
  },
})
