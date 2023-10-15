import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      input: 'src/index.ts',
      name: 'index',
    },
  ],
  failOnWarn: false,
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  externals: [
    '@pinceau/core',
    '@pinceau/core/runtime',
    '@pinceau/theme',
    '@pinceau/style',
    '@pinceau/runtime',
    '@pinceau/vue',
    '$pinceau/utils',
    'vite',
  ],
})
