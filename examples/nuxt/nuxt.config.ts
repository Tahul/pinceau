import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  alias: {
    '@pinceau/stringify': resolve('../../packages/stringify/src/index.ts'),
    '@pinceau/runtime': resolve('../../packages/runtime/src/index.ts'),
    '@pinceau/vue/runtime': resolve('../../packages/vue/src/runtime.ts'),
    '@pinceau/core/runtime': resolve('../../packages/core/src/runtime.ts'),
    '@pinceau/theme/runtime': resolve('../../packages/theme/src/runtime.ts'),
  },
  modules: [
    '@pinceau/nuxt',
  ],
  components: [
    {
      path: resolve('../shared'),
      global: true
    }
  ],
  pinceau: {
    theme: {
      layers: [
        {
          path: resolve('../../packages/palette/'),
        }
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
