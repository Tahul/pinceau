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
    'style-dictionary-esm',
    'untyped',
    'pathe',
    'jiti',
    '#pinceau',
    'vite',
    'unplugin',
  ],
})
