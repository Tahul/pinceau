import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import PinceauVitePlugin from '@pinceau/vite'
import { PinceauThemePlugin } from '@pinceau/theme'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue(),
    PinceauVitePlugin({}),
    PinceauThemePlugin({}),
  ],
})
