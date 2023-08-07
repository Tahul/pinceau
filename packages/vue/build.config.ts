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
      input: 'src/transforms.ts',
      name: 'transforms',
    },
    {
      input: 'src/runtime.ts',
      name: 'runtime',
    },
  ],
  failOnWarn: false,
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  externals: [
    'vue/compiler-sfc',
    'magic-string',
    'sfc-composer',
    'vite',
    'vue',
    'unplugin',
    'ast-types',
    'ohash',
    'scule',
    '@vue',
    '@volar',
    '$pinceau',
    'pathe',
  ],
})
