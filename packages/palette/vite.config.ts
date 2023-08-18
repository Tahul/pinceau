import path from 'node:path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pinceau from 'pinceau/plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue(),
    Pinceau({
      debug: 2,
      theme: {
        buildDir: path.join(__dirname, './output/'),
      },
    }),
  ],
})
