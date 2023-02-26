import { build } from 'tsup'
import { env, node, nodeless } from 'unenv'

const { external, alias } = env(nodeless, node)

build({
  minify: false,
  treeshake: false,
  platform: 'browser',
  format: ['esm'],
  entry: ['src/index.ts', 'src/utils.ts', 'src/runtime.ts', 'src/volar.ts'],
  outDir: 'dist/browser',
  clean: true,
  esbuildOptions: (options) => {
    options.external = options.external ?? []
    options.external.push('@vue/*')
    options.external.push('vue')
    options.external.push('jiti')
    options.external.push('@volar/*')
    options.external.push(...external)
    options.alias = options.alias ?? {}
    options.alias = {
      ...options.alias,
      ...alias,
      'fs': 'fs',
      'node:fs': 'node:fs',
      'fs/promises': 'fs/promises',
      'node:fs/promises': 'node:fs/promises',
    }
    options.define = {
      'process.env': '0',
      'process.cwd': '() => \'\'',
      'process.platform': '0',
    }
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
