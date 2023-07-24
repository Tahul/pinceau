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
    '@pinceau/style',
    '@volar/vue-language-core',
    '@volar/language-core',
    '@volar/source-map',
    'muggle-string',
  ],
})
