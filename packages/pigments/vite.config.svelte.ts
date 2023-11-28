import path from 'node:path'
import { defineConfig } from 'vite'
import Pinceau from '../../integrations/pinceau/src/plugin'
import { PinceauSveltePlugin } from '../../integrations/svelte/src/unplugin'

export default defineConfig({
  plugins: [
    Pinceau({
      debug: 2,
      dev: false,
      theme: {
        buildDir: path.join(__dirname, '../outputs/'),
      },
    }),
    PinceauSveltePlugin.vite(),
  ],
})
