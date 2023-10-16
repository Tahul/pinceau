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
      style: {
        excludes: [
          resolve('../../packages'),
        ],
      }
    }),
    svelte(),
  ],
})
