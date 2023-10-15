import { defineBuildConfig } from 'unbuild'

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
  ],
  failOnWarn: false,
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  externals: [
    '$pinceau/theme',
    '$pinceau/utils',
    '$pinceau/svelte-plugin',
    'svelte/elements',
    'svelte/compiler',
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
})
