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
    '#pinceau',
    'unplugin',
    'magic-string',
    'ast-types',
    'recast',
    'defu',
    'vite',
    '@babel/types',
    'untyped',
    'rollup',
    '@vue/compiler-core',
    'csstype',
    'sfc-composer',
    'pathe',
    'postcss-nested',
    'postcss-custom-properties',
    'postcss-dark-theme-class',
    'scule',
    'postcss',
  ],
})
