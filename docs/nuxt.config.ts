import process from 'node:process'
import { resolve } from 'pathe'

// Enforce local Pinceau
process.env.THEME_DEV_PINCEAU_PATH = resolve(__dirname, '../src/nuxt.ts')

// @ts-ignore
export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
  alias: {
    'pinceau/runtime': resolve(__dirname, '../src/runtime.ts'),
    'pinceau': resolve(__dirname, '../src/index.ts'),
    'pinceau/nuxt': resolve(__dirname, '../src/nuxt.ts'),
  },
  studio: {
    enabled: 'production',
  },
  pinceau: {
    followSymbolicLinks: false,
  },
  components: [
    {
      path: '~/components',
      global: true,
    },
  ],
  css: [
    '~/main.postcss',
  ],
  content: {
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark',
      },
    },
  },
})
