import { createResolver } from '@nuxt/kit'
import { defineNuxtConfig } from 'nuxt/config'

const resolve = (p: string) => createResolver(import.meta.url).resolve(p)

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon.png',
        },
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/favicon.svg',
        },
      ],
    },
  },

  devtools: { enabled: true },

  typescript: {
    includeWorkspace: false,
  },

  modules: [
    '@nuxt/content',
    '@pinceau/nuxt',
  ],

  pinceau: {
    debug: 2,
    style: {
      excludes: [
        resolve('../../packages'),
      ],
    },
    theme: {
      buildDir: resolve('./node_modules/.pinceau'),
      layers: [
        {
          path: resolve('../../packages/pigments/'),
        },
      ],
    },
  },

  content: {
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark',
      },
    },
  },
})
