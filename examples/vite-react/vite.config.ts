import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import React from '@vitejs/plugin-react'
import Pinceau from '@pinceau/react/plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Pinceau(
      {
        style: {
          excludes: [
            resolve('../../packages'),
          ],
        }
      },
    ),
    React(),
  ],
})
