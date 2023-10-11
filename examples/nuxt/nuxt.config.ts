import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  modules: [
    '@pinceau/nuxt',
  ],
  components: [
    {
      path: resolve('../shared'),
      global: true,
    },
  ],
  pinceau: {
    theme: {
      layers: [
        {
          path: resolve('../../packages/palette/'),
        },
      ],
    },
    style: {
      excludes: [
        resolve('../../packages'),
      ],
    },
  },
  typescript: {
    includeWorkspace: true,
  },
})
