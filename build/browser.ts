import { build } from 'tsup'

build({
  minify: false,
  treeshake: false,
  format: ['esm', 'iife'],
  entry: ['src/index.ts', 'src/utils.ts', 'src/runtime.ts'],
  outDir: 'dist/browser',
  clean: true,
  esbuildOptions: (options) => {
    options.external = options.external ?? []
    options.external.push('@vue/*')
    options.external.push('vue')
    options.external.push('jiti')
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
