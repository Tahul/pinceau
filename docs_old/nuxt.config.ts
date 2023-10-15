import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
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
