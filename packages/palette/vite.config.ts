import path from 'node:path'
import { defineConfig } from 'vite'
import Pinceau from 'pinceau/plugin'
import { PinceauSveltePlugin } from '@pinceau/svelte/utils'
import { PinceauReactPlugin } from '@pinceau/react/utils'
import { PinceauVuePlugin } from '@pinceau/vue/utils'

export default defineConfig({
  plugins: [
    Pinceau({
      debug: 2,
      dev: false,
      theme: {
        buildDir: path.join(__dirname, './output/'),
      },
    }),
    PinceauSveltePlugin.vite(),
    PinceauReactPlugin.vite(),
    PinceauVuePlugin.vite(),
  ],
})
