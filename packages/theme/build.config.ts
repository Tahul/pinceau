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
  ],
  failOnWarn: false,
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  externals: [
    'ast-types',
    '@pinceau/style',
    'style-dictionary-esm',
    'untyped',
    'pathe',
    'jiti',
    '#pinceau',
    'vite',
    'unplugin',
  ],
})
