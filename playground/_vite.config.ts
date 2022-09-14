import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Vue from '@vitejs/plugin-vue'
import { join } from 'pathe'
import Unplugin from '../src/vite'

export default defineConfig({
  logLevel: 'info',
  plugins: [
    Inspect(),
    Unplugin({
      configFileName: 'tokens.config',
      configOrPaths: [
        join(__dirname, 'theme'),
      ],
    }),
    Vue(),
  ],
})
