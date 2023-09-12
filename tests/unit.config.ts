import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      // @pinceau/core
      '@pinceau/core/utils': resolve(__dirname, '../packages/core/src/utils.ts'),
      '@pinceau/core/plugin': resolve(__dirname, '../packages/core/src/plugin.ts'),
      '@pinceau/core/runtime': resolve(__dirname, '../packages/core/src/runtime.ts'),
      '@pinceau/core': resolve(__dirname, '../packages/core/src/index.ts'),

      // @pinceau/theme
      '@pinceau/theme/plugin': resolve(__dirname, '../packages/theme/src/plugin.ts'),
      '@pinceau/theme/transforms': resolve(__dirname, '../packages/theme/src/transforms.ts'),
      '@pinceau/theme/utils': resolve(__dirname, '../packages/theme/src/utils.ts'),
      '@pinceau/theme/runtime': resolve(__dirname, '../packages/theme/src/runtime.ts'),
      '@pinceau/theme': resolve(__dirname, '../packages/theme/src/index.ts'),

      // @pinceau/runtime
      '@pinceau/runtime/plugin': resolve(__dirname, '../packages/runtime/src/plugin.ts'),
      '@pinceau/runtime': resolve(__dirname, '../packages/runtime/src/index.ts'),

      // @pinceau/style
      '@pinceau/style/utils': resolve(__dirname, '../packages/style/src/utils.ts'),
      '@pinceau/style/plugin': resolve(__dirname, '../packages/style/src/plugin.ts'),
      '@pinceau/style/transforms': resolve(__dirname, '../packages/style/src/transforms.ts'),
      '@pinceau/style': resolve(__dirname, '../packages/style/src/index.ts'),

      // @pinceau/vue
      '@pinceau/vue/plugin': resolve(__dirname, '../packages/vue/src/plugin.ts'),
      '@pinceau/vue/transforms': resolve(__dirname, '../packages/vue/src/transforms.ts'),
      '@pinceau/vue/runtime': resolve(__dirname, '../packages/vue/src/runtime.ts'),
      '@pinceau/vue/utils': resolve(__dirname, '../packages/vue/src/utils.ts'),
      '@pinceau/vue': resolve(__dirname, '../packages/vue/src/index.ts'),

      // @pinceau/language-server
      '@pinceau/language-server': resolve(__dirname, '../packages/language-server/src/index.ts'),

      // @pinceau/vscode
      '@pinceau/vscode': resolve(__dirname, '../packages/vscode/src/index.ts'),

      // pinceau (main plugin)
      'pinceau/plugin': resolve(__dirname, '../packages/pinceau/src/plugin.ts'),
      'pinceau': resolve(__dirname, '../packages/pinceau/src/index.ts'),
    },
  },

  test: {
    globals: true,
    watch: true,
    include: ['unit/*.test.ts'],
    coverage: {
      enabled: true,
      reporter: ['text', 'json', 'html'],
      allowExternal: true,
      include: [resolve(__dirname, '../packages/**/src/**/*')],
      exclude: ['../examples/**/*', '../node_modules/**/*'],
      clean: true,
      all: true,
    },
  },
})
