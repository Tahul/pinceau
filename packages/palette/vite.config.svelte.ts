import path from 'node:path'
import { defineConfig } from 'vite'
import Pinceau from 'pinceau/plugin'
import { PinceauSveltePlugin } from '@pinceau/svelte/utils'

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
  ],
})
