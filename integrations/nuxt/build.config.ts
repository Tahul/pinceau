import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      input: 'src/module.ts',
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
    '@nuxt',
    'jiti',
    'chalk',
    'consola',
    'defu',
    '@volar',
    'pathe',
    'pinceau',
    '@pinceau/core',
    '@pinceau/theme',
    '#internal',
    '#internal/nitro',
    '@pinceau/theme/runtime',
    '@pinceau/core/utils',
  ],
})
