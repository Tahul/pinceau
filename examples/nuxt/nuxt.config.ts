import { defineNuxtConfig } from 'nuxt/config'
import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  modules: [
    '@pinceau/nuxt',
  ],
  pinceau: {
    style: {
      excludes: [
        resolve('../../packages'),
      ],
    }
  },
  typescript: {
    includeWorkspace: true,
  },
})
