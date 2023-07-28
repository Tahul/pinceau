import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index.ts',
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
  ],
})
