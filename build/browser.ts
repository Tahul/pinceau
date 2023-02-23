import { build } from 'tsup'

build({
  minify: false,
  format: 'iife',
  entry: ['src/index.ts', 'src/utils.ts', 'src/runtime.ts'],
  outDir: 'dist/browser',
  clean: true,
  esbuildOptions: (options) => {
    options.external = options.external ?? []
    options.external.push('@vue/*')
    options.external.push('vue')
  },
}).then(() => console.log('Build completed (browser).'))
