import { build } from 'tsup'
import { env, node, nodeless } from 'unenv'

const { external } = env(nodeless, node)

build({
  minify: false,
  treeshake: false,
  platform: 'browser',
  format: ['esm', 'iife'],
  entry: ['src/index.ts', 'src/utils.ts', 'src/runtime.ts'],
  outDir: 'dist/browser',
  clean: true,
  esbuildOptions: (options) => {
    options.external = options.external ?? []
    options.external.push('@vue/*')
    options.external.push('vue')
    options.external.push('jiti')
    options.external.push(...external)
    options.splitting = false
  },
  noExternal: [
    'style-dictionary-esm',
    'nanoid',
    'scule',
    'recast',
    'ohash',
    'scule',
    'pathe',
    'defu',
    'postcss-nested',
    'postcss-custom-properties',
    'postcss-dark-theme-class',
    'consola',
    'acorn',
  ],
}).then(() => console.log('Build completed (browser).'))
