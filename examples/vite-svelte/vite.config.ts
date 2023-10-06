import { createResolver } from '@nuxt/kit'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import Pinceau from '@pinceau/svelte/plugin'

const resolve = (p: string) => createResolver(import.meta.url).resolve(p)

const root = resolve('../../')

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    fs: {
      allow: [
        // search up for workspace root
        root,
      ],
    },
  },
  plugins: [
    Pinceau({
      vue: false,
      debug: 2,
      style: {
        excludes: [
          resolve('../../packages'),
        ],
      },
      theme: {
        buildDir: resolve('./node_modules/.pinceau/'),
        layers: [
          {
            path: resolve('../../packages/palette/'),
          },
        ],
      },
    }),
    svelte(),
  ],
})
