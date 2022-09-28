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
      input: 'src/utils.ts',
      name: 'utils',
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
    'vue',
    '@vue/reactivity',
    'style-dictionary-esm',
    'json5',
    'chalk',
    'jiti',
    'tinycolor2',
    'virtual:pinceau/theme/flat',
    '#pinceau/types',
  ],
  hooks: {
    'build:done': () => {
      execSync('npm run build:fix')
      execSync('cp src/runtime.ts dist/runtime.ts')
      execSync('cp -r src/runtime/ dist/runtime/')
    },
  },
})
