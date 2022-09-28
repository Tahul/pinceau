import { execSync } from 'child_process'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  failOnWarn: false,
  entries: [
    {
      input: 'src/index.ts',
      name: 'index',
    },
    {
      input: 'src/vite.ts',
      name: 'vite',
    },
    {
      input: 'src/nuxt.ts',
      name: 'nuxt',
    },
    {
      input: 'src/runtime.ts',
      name: 'runtime',
    },
  ],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  externals: [
    'ohash',
    'vite',
    'pathe',
    'fast-glob',
    'ufo',
    '@nuxt/kit',
    '@vue/compiler-sfc',
    'pinceau__flat.ts',
    'pinceau__flat.js',
    'vue',
    '@vue/reactivity',
    'style-dictionary-esm',
    'json5',
    'chalk',
    'jiti',
    'tinycolor2',
    '#pinceau/theme/flat',
    '#pinceau/theme',
    '#pinceau/types',
  ],
  hooks: {
    'build:done': () => {
      execSync('npm run build:fix')
    },
  },
})
