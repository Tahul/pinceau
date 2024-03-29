import path from 'node:path'
import { defineConfig } from 'vite'
import Pinceau from '../../integrations/pinceau/src/plugin'
import { PinceauVuePlugin } from '../../integrations/vue/src/unplugin'

export default defineConfig({
  plugins: [
    Pinceau({
      debug: 2,
      dev: false,
      theme: {
        buildDir: path.join(__dirname, '../outputs/'),
      },
    }),
    PinceauVuePlugin.vite(),
  ],
})
