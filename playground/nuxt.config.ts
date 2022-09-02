import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  extends: ['./theme'],
  modules: ['../src/nuxt.ts'],
})
