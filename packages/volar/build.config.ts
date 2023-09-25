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
    inlineDependencies: true,
  },
  externals: [
    'defu',
    '@pinceau/style',
    '@volar/vue-language-core',
    '@volar/language-core',
    '@volar/source-map',
    'muggle-string',
  ],
})
