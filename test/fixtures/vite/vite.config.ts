import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import { resolve } from 'pathe'
import Unplugin from 'pinceau/vite'

export default defineConfig({
  logLevel: 'info',
  plugins: [
    Unplugin({
      configLayers: [
        resolve(__dirname, '../theme'),
      ],
      colorSchemeMode: 'media',
    }),
    Vue(),
  ],
})
