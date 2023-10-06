import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      input: 'src/index.ts',
      name: 'index',
    },
    {
      input: 'src/plugin.ts',
      name: 'plugin',
    },
    {
      input: 'src/runtime.ts',
      name: 'runtime',
    },
    {
      input: 'src/utils.ts',
      name: 'utils',
    },
  ],
  failOnWarn: false,
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  externals: [
    'defu',
    'recast',
    'recast/parsers/typescript.js',
    'ast-types',
    'unplugin',
    'vite',
    '@babel/types',
    'rollup',
    'magic-string',
    'sfc-composer',
    'pathe',
    'chalk',
    'consola',
    'ultrahtml',
    '@pinceau',
    '@pinceau/core/utils',
    '@pinceau/theme/plugin',
    '@pinceau/style/plugin',
    '@pinceau/runtime/plugin',
  ],
})
