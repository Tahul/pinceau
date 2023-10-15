import path from 'node:path'
import { defineConfig } from 'vite'
import Pinceau from 'pinceau/plugin'
import { PinceauReactPlugin } from '@pinceau/react/utils'

export default defineConfig({
  plugins: [
    Pinceau({
      debug: 2,
      dev: false,
      theme: {
        buildDir: path.join(__dirname, './output/'),
      },
    }),
    PinceauReactPlugin.vite(),
  ],
})
