import Vue from '@vitejs/plugin-vue'
import { splitVendorChunkPlugin } from 'vite'
import { resolve } from 'pathe'
import { defineConfig } from 'vitest/config'
import Unplugin from './src/vite'

export default defineConfig({
  logLevel: 'info',
  resolve: {
    alias: {
      '/@': resolve(__dirname, './test/fixtures/shared/components/native-syntaxes'),
      '@': resolve(__dirname, './test/fixtures/shared/components/native-syntaxes'),
      '@src/utils': resolve(__dirname, './src/utils/'),
      'pinceau/runtime': resolve(__dirname, './src/runtime.ts'),
      'pinceau': resolve(__dirname, './src/index.ts'),
    },
  },
  test: {
    globals: true,
    watch: true,
    environment: 'jsdom',
  },
  plugins: [

    splitVendorChunkPlugin(),
    Vue({
      reactivityTransform: true,
    }),
    Unplugin({
      configFileName: 'tokens.config',
      configLayers: [
        resolve(__dirname, './playground/theme'),
      ],
    }),
  ],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  build: {
    // to make tests faster
    minify: false,
    rollupOptions: {
      output: {
        // Test splitVendorChunkPlugin composition
        manualChunks(id) {
          if (id.includes('src-import')) {
            return 'src-import'
          }
        },
      },
    },
  },
})
