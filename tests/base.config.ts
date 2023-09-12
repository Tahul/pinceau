import { resolve } from 'pathe'

export const alias = {
  // pinceau (main plugin)
  'pinceau': resolve(__dirname, '../packages/pinceau/src/index.ts'),

  // @pinceau/core
  '@pinceau/core': resolve(__dirname, '../packages/core/src/index.ts'),
  '@pinceau/core/utils': resolve(__dirname, '../packages/core/src/utils.ts'),
  '@pinceau/core/plugin': resolve(__dirname, '../packages/core/src/plugin.ts'),
  '@pinceau/core/runtime': resolve(__dirname, '../packages/core/src/runtime.ts'),

  // @pinceau/theme
  '@pinceau/theme': resolve(__dirname, '../packages/theme/src/index.ts'),
  '@pinceau/theme/plugin': resolve(__dirname, '../packages/theme/src/plugin.ts'),
  '@pinceau/theme/transforms': resolve(__dirname, '../packages/theme/src/transforms.ts'),
  '@pinceau/theme/utils': resolve(__dirname, '../packages/theme/src/utils.ts'),

  // @pinceau/runtime
  '@pinceau/runtime': resolve(__dirname, '../packages/runtime/src/index.ts'),
  '@pinceau/runtime/plugin': resolve(__dirname, '../packages/runtime/src/plugin.ts'),

  // @pinceau/style
  '@pinceau/style': resolve(__dirname, '../packages/style/src/index.ts'),
  '@pinceau/style/plugin': resolve(__dirname, '../packages/style/src/plugin.ts'),
  '@pinceau/style/transforms': resolve(__dirname, '../packages/style/src/transforms.ts'),

  // @pinceau/vue
  '@pinceau/vue': resolve(__dirname, '../packages/vue/src/index.ts'),
  '@pinceau/vue/plugin': resolve(__dirname, '../packages/vue/src/plugin.ts'),
  '@pinceau/vue/transforms': resolve(__dirname, '../packages/vue/src/transforms.ts'),
  '@pinceau/vue/runtime': resolve(__dirname, '../packages/vue/src/transforms.ts'),

  // @pinceau/language-server
  '@pinceau/language-server': resolve(__dirname, '../packages/language-server/src/index.ts'),

  // @pinceau/vscode
  '@pinceau/vscode': resolve(__dirname, '../packages/vscode/src/index.ts'),
}

export const build = {
  // to make tests faster
  minify: false,
  rollupOptions: {
    output: {
      // Test splitVendorChunkPlugin composition
      manualChunks(id: string) {
        if (id.includes('src-import')) {
          return 'src-import'
        }
      },
    },
  },
}
