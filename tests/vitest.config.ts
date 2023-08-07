import Vue from '@vitejs/plugin-vue'
import { splitVendorChunkPlugin } from 'vite'
import { join, resolve } from 'pathe'
import { defineConfig } from 'vitest/config'
import Pinceau from 'pinceau'

export default defineConfig({
  logLevel: 'info',
  resolve: {
    alias: {
      // pinceau (main plugin)
      'pinceau': resolve(__dirname, '../packages/pinceau/src/index.ts'),

      // @pinceau/core
      '@pinceau/core': resolve(__dirname, '../packages/core/src/index.ts'),
      '@pinceau/core/plugin': resolve(__dirname, '../packages/core/src/plugin.ts'),

      // @pinceau/theme
      '@pinceau/theme': resolve(__dirname, '../packages/theme/src/index.ts'),
      '@pinceau/theme/plugin': resolve(__dirname, '../packages/theme/src/plugin.ts'),
      '@pinceau/theme/transforms': resolve(__dirname, '../packages/theme/src/transforms.ts'),

      // @pinceau/runtime
      '@pinceau/runtime': resolve(__dirname, '../packages/runtime/src/index.ts'),
      '@pinceau/runtime/plugin': resolve(__dirname, '../packages/runtime/src/plugin.ts'),
      '@pinceau/runtime/transforms': resolve(__dirname, '../packages/runtime/src/transforms.ts'),

      // @pinceau/style
      '@pinceau/style': resolve(__dirname, '../packages/style/src/index.ts'),
      '@pinceau/style/plugin': resolve(__dirname, '../packages/style/src/plugin.ts'),
      '@pinceau/style/transforms': resolve(__dirname, '../packages/style/src/transforms.ts'),

      // @pinceau/vue
      '@pinceau/vue': resolve(__dirname, '../packages/vue/src/index.ts'),
      '@pinceau/vue/plugin': resolve(__dirname, '../packages/vue/src/plugin.ts'),
      '@pinceau/vue/transforms': resolve(__dirname, '../packages/vue/src/transforms.ts'),

      // @pinceau/language-server
      '@pinceau/language-server': resolve(__dirname, '../packages/language-server/src/index.ts'),

      // @pinceau/vscode
      '@pinceau/vscode': resolve(__dirname, '../packages/vscode/src/index.ts'),
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
    Pinceau({
      theme: {
        configLayers: [
          {
            configFileName: 'tokens.config',
            cwd: resolve(__dirname, './fixtures'),
          },
        ],
        configResolved(config) {
          console.log({ config })
        },
        buildDir: join(__dirname, './fixtures/theme/'),
      },
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
