import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
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
