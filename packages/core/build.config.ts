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
      input: 'src/runtime.ts',
      name: 'runtime',
    },
    {
      input: 'src/utils.ts',
      name: 'utils',
    },
  ],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  externals: [
    'vite',
    'unplugin',
    'ultrahtml',
    'sfc-composer',
    'rollup',
    'recast/parsers/typescript.js',
    'recast',
    'pathe',
    'magic-string',
    'defu',
    'consola',
    'chalk',
    'ast-types',
    '@pinceau/outputs',
    '@pinceau/vue',
    '@pinceau/theme/utils',
    '@pinceau/theme/plugin',
    '@pinceau/theme',
    '@pinceau/svelte',
    '@pinceau/style/plugin',
    '@pinceau/style',
    '@pinceau/runtime/plugin',
    '@pinceau/react',
    '@pinceau/core/utils',
    '@pinceau/core',
    '@pinceau/astro',
    '@babel/types',
    '@babel/parser',
  ],
})
