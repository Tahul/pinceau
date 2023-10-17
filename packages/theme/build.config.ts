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
    'ast-types',
    '@babel/types',
    '@pinceau',
    '@pinceau/style',
    '@pinceau/core',
    '@pinceau/core/runtime',
    'defu',
    'sfc-composer',
    'ultrahtml',
    'magic-string',
    'recast',
    '@babel/parser',
    'micromatch',
    'recast/parsers/typescript.js',
    'style-dictionary-esm',
    'untyped',
    'pathe',
    'jiti',
    '$pinceau',
    'vite',
    'unplugin',
    '@pinceau/core/utils',
    '@pinceau/core',
  ],
})
