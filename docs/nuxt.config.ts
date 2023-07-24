import process from 'node:process'
import { resolve } from 'pathe'

// Enforce local Pinceau
process.env.THEME_DEV_PINCEAU_PATH = resolve(__dirname, '../src/nuxt.ts')

export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
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
