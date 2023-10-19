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
    {
      input: 'src/unplugin.ts',
      name: 'unplugin',
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
    'sfc-composer',
    'scule',
    'recast',
    'react',
    'pathe',
    'ohash',
    'nanoid',
    'magic-string',
    'defu',
    'csstype',
    'ast-types',
    'acorn',
    '@pinceau/outputs/react-plugin',
    '@types/react',
    '@types/react-dom',
    '@types/node',
    '@pinceau/theme',
    '@pinceau/style/utils',
    '@pinceau/style',
    '@pinceau/runtime',
    '@pinceau/core/utils',
    '@pinceau/core/plugin',
    '@pinceau/core',
  ],
})
