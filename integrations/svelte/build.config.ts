import { defineBuildConfig } from 'unbuild'

// @ts-ignore
import svelte from 'rollup-plugin-svelte'

export default defineBuildConfig({
  entries: [
    {
      input: 'src/index.ts',
      name: 'index',
    },
    {
      input: 'src/plugin.ts',
      name: 'plugin',
    },
    {
      input: 'src/transforms.ts',
      name: 'transforms',
    },
    {
      input: 'src/utils.ts',
      name: 'utils',
    },
    {
      input: 'src/runtime.ts',
      name: 'runtime',
    },
    {
      input: 'src/unplugin.ts',
      name: 'unplugin',
    },
    {
      input: 'src/component.ts',
      name: 'component',
    },
  ],

  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  externals: [
    '@pinceau/outputs',
    '@pinceau/outputs/svelte-plugin',
    'svelte/elements',
    'svelte/compiler',
    'svelte/internal',
    'svelte',
    'sfc-composer/svelte',
    'rollup',
    'svelte',
    '@pinceau/runtime',
    '@pinceau/theme',
    '@pinceau/style',
    'pathe',
    '@pinceau/core/utils',
    '@pinceau/core',
    '@pinceau/theme',
    '@pinceau/style/utils',
    'csstype',
    'unplugin',
    'magic-string',
    'sfc-composer',
    'defu',
    'recast',
    'ohash',
    'ast-types',
    'acorn',
    'scule',
    'nanoid',
  ],
  hooks: {
    'rollup:options': async (ctx, options) => {
      (options.plugins as any).push(
        svelte(),
      )
    },
  },
})
