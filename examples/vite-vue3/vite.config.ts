import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pinceau from 'pinceau'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue(),
    Pinceau({}),
  ],
})
