import { execSync } from 'child_process'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/vite',
    'src/nuxt',
    'src/utils',
    'src/runtime',
    'src/nitro',
    'src/volar',
  ],
  failOnWarn: false,
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
    '#pinceau',
    'nitropack',
  ],
  hooks: {
    'build:done': () => {
      execSync('npm run build:fix')
    },
  },
})
