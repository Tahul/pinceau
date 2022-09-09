import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  extends: ['./theme'],
  modules: ['../src/nuxt.ts'],
  pinceau: {
    configFileName: 'tokens.config',
  },
})
