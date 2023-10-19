import { build } from 'tsup'
import { env, nodeless } from 'unenv'

const { external, alias } = env(nodeless)

build({
  // minify: true,
  treeshake: true,
  dts: true,
  platform: 'browser',
  format: ['esm'],
  entry: [
    './src/theme.ts',
    './src/theme-runtime.ts',
    './src/core.ts',
    './src/core-runtime.ts',
    './src/svelte.ts',
    './src/svelte-runtime.ts',
    './src/vue.ts',
    './src/vue-runtime.ts',
    './src/react.ts',
    './src/react-runtime.ts',
  ],
  outDir: 'dist/',
  clean: true,
  esbuildOptions: (options) => {
    options.ignoreAnnotations = true
    options.external = options.external ?? []
    options.external.push('@vue/*')
    options.external.push('vue')
    options.external.push('svelte')
    options.external.push('svelte/*')
    options.external.push('@sveltejs/*')
    options.external.push('react')
    options.external.push('react-dom')
    options.external.push('@volar/*')
    options.external.push(...external)
    options.external.push('@pinceau/outputs')
    options.external.push('@pinceau/outputs/*')
    options.alias = options.alias ?? {}
    options.alias = {
      ...options.alias,
      ...alias,
      'fast-glob': 'unenv/runtime/mock/noop',
    }
    options.define = {
      'process.env': '0',
      'pathToFileURL': '0',
      'process.platform': '0',
    }
    options.splitting = true
  },
  noExternal: [
    'sfc-composer',
    'style-dictionary-esm',
    'nanoid',
    'scule',
    'recast',
    'ohash',
    'scule',
    'pathe',
    'defu',
    'consola',
    'acorn',
  ],
}).then(() => console.log('Build completed (browser).'))
