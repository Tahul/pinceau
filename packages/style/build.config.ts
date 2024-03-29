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
  ],

  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  externals: [
    '@pinceau/runtime',
    '@pinceau/theme',
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
    '@pinceau/outputs',
  ],
})
