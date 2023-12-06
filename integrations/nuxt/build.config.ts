import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      input: 'src/module.ts',
      name: 'index',
    },
  ],

  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  externals: [
    '@nuxt',
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
