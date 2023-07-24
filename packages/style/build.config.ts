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
    'magic-string',
    'sfc-composer',
    'defu',
    'recast',
    'ohash',
    'ast-types',
    'acorn',
    'scule',
  ],
})
