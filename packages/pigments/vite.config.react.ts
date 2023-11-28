import path from 'node:path'
import { defineConfig } from 'vite'
import Pinceau from '../../integrations/pinceau/src/plugin'
import { PinceauReactPlugin } from '../../integrations/react/src/unplugin'

export default defineConfig({
  plugins: [
    Pinceau({
      debug: 2,
      dev: false,
      theme: {
        buildDir: path.join(__dirname, '../outputs/'),
      },
    }),
    PinceauReactPlugin.vite(),
  ],
})
