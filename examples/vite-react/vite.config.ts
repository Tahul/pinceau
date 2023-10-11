import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import React from '@vitejs/plugin-react'
import Pinceau from '@pinceau/jsx/plugin'

const root = resolve('../../')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Pinceau(
      {
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
      },
    ),
    React(),
  ],
})
