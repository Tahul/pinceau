import { resolve } from 'node:path'

export const alias = {
  // PACKAGES

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

  // @pinceau/stringify
  '@pinceau/stringify': resolve(__dirname, '../packages/stringify/src/index.ts'),

  // @pinceau/integration
  '@pinceau/integration': resolve(__dirname, '../packages/integration/src/index.ts'),

  // @pinceau/style
  '@pinceau/style/utils': resolve(__dirname, '../packages/style/src/utils.ts'),
  '@pinceau/style/plugin': resolve(__dirname, '../packages/style/src/plugin.ts'),
  '@pinceau/style/transforms': resolve(__dirname, '../packages/style/src/transforms.ts'),
  '@pinceau/style': resolve(__dirname, '../packages/style/src/index.ts'),

  // INTEGRATIONS

  // @pinceau/vue
  '@pinceau/vue/plugin': resolve(__dirname, '../integrations/vue/src/plugin.ts'),
  '@pinceau/vue/transforms': resolve(__dirname, '../integrations/vue/src/transforms.ts'),
  '@pinceau/vue/runtime': resolve(__dirname, '../integrations/vue/src/runtime.ts'),
  '@pinceau/vue/utils': resolve(__dirname, '../integrations/vue/src/utils.ts'),
  '@pinceau/vue/unplugin': resolve(__dirname, '../integrations/vue/src/unplugin.ts'),
  '@pinceau/vue': resolve(__dirname, '../integrations/vue/src/index.ts'),

  // @pinceau/svelte
  '@pinceau/svelte/plugin': resolve(__dirname, '../integrations/svelte/src/plugin.ts'),
  '@pinceau/svelte/transforms': resolve(__dirname, '../integrations/svelte/src/transforms.ts'),
  '@pinceau/svelte/runtime': resolve(__dirname, '../integrations/svelte/src/runtime.ts'),
  '@pinceau/svelte/utils': resolve(__dirname, '../integrations/svelte/src/utils.ts'),
  '@pinceau/svelte/unplugin': resolve(__dirname, '../integrations/svelte/src/unplugin.ts'),
  '@pinceau/svelte': resolve(__dirname, '../integrations/svelte/src/index.ts'),

  // @pinceau/astro
  '@pinceau/astro/plugin': resolve(__dirname, '../integrations/astro/src/plugin.ts'),
  '@pinceau/astro/transforms': resolve(__dirname, '../integrations/astro/src/transforms.ts'),
  '@pinceau/astro/runtime': resolve(__dirname, '../integrations/astro/src/runtime.ts'),
  '@pinceau/astro/utils': resolve(__dirname, '../integrations/astro/src/utils.ts'),
  '@pinceau/astro': resolve(__dirname, '../integrations/astro/src/index.ts'),

  // @pinceau/react
  '@pinceau/react/plugin': resolve(__dirname, '../integrations/react/src/plugin.ts'),
  '@pinceau/react/transforms': resolve(__dirname, '../integrations/react/src/transforms.ts'),
  '@pinceau/react/runtime': resolve(__dirname, '../integrations/react/src/runtime.ts'),
  '@pinceau/react/utils': resolve(__dirname, '../integrations/react/src/utils.ts'),
  '@pinceau/react/unplugin': resolve(__dirname, '../integrations/react/src/unplugin.ts'),
  '@pinceau/react': resolve(__dirname, '../integrations/react/src/index.ts'),

  // @pinceau/language-server
  '@pinceau/language-server': resolve(__dirname, '../integrations/language-server/src/index.ts'),

  // @pinceau/vscode
  '@pinceau/vscode': resolve(__dirname, '../integrations/vscode/src/index.ts'),

  // @pinceau/nuxt
  '@pinceau/next': resolve(__dirname, '../integrations/next/src/index.ts'),

  // @pinceau/nuxt
  '@pinceau/nuxt': resolve(__dirname, '../integrations/nuxt/src/index.ts'),

  // @pinceau/volar
  '@pinceau/volar': resolve(__dirname, '../integrations/volar/src/index.ts'),

  // pinceau (main plugin)
  'pinceau/plugin': resolve(__dirname, '../integrations/pinceau/src/plugin.ts'),
  'pinceau': resolve(__dirname, '../integrations/pinceau/src/index.ts'),
}
