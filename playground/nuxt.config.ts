import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  extends: ['./theme'],
  modules: ['../src/nuxt.ts'],
  pinceau: {
    configFileName: 'tokens.config',
  },
  hooks: {
    // @ts-expect-error - ???
    'pinceau:options': (options) => {
      // console.log({ options })
      return options
    },
  },
})
