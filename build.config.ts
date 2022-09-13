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
  ],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  externals: [
    'vite',
    'pathe',
    'fast-glob',
    'ufo',
    '@nuxt/kit',
    '@vue/compiler-sfc',
    'style-dictionary-esm',
    'json5',
    'chalk',
    'jiti',
    'tinycolor2',
    '#pinceau',
    '#pinceau/types',
  ],
  hooks: {
    'build:done': () => {
      execSync('npm run build:fix')
    },
  },
})
