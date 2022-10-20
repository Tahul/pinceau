import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import { resolve } from 'pathe'
import Unplugin from 'pinceau/vite'

export default defineConfig({
  logLevel: 'info',
  plugins: [
    Unplugin({
      configFileName: 'tokens.config',
      configOrPaths: [
        resolve(__dirname, '../theme'),
      ],
      colorSchemeMode: 'class',
    }),
    Vue(),
  ],
})
