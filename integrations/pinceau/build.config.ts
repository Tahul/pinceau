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
  ],

  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  externals: [
    '$pinceau',
    '$pinceau/theme',
    '$pinceau/utils',
    '@pinceau/core',
    '@pinceau/theme',
    '@pinceau/style',
    '@pinceau/runtime',
    '@pinceau/vue',
    'vite',
  ],
})
