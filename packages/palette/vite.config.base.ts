import path from 'node:path'
import { createResolver } from '@nuxt/kit'
import { defineConfig } from 'vite'
import Pinceau from 'pinceau/plugin'

export default defineConfig({
  plugins: [
    Pinceau({
      debug: 2,
      dev: false,
      theme: {
        buildDir: path.join(__dirname, './output/'),
      },
    }),
  ],
})
