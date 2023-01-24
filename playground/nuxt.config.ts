import { resolve } from 'pathe'

export default defineNuxtConfig({
  // ssr: false,
  extends: [resolve(__dirname, './theme')],
  modules: ['../src/nuxt.ts', '@nuxtjs/color-mode', '@nuxt/content', '@nuxthq/studio'],
  alias: {
    'pinceau/runtime': resolve(__dirname, '../src/runtime.ts'),
    'pinceau': resolve(__dirname, '../src/index.ts'),
  },
  studio: {
    enabled: true,
  },
  css: [
    '~/main.css',
  ],
  pinceau: {
    configFileName: 'tokens.config',
    debug: false,
  },
  colorMode: {
    classSuffix: '',
  },
  typescript: {
    includeWorkspace: true,
  },
  componentMeta: {
    debug: 2,
  },
})
