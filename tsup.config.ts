import type { Options } from 'tsup'

export default <Options>{
  entryPoints: [
    'src/*.ts',
  ],
  clean: true,
  format: ['cjs', 'esm'],
  dts: true,
  external: [
    'vite',
    '#pinceau',
    '#pinceau/types',
    '@nuxt/schema',
    '@nuxt/kit',
    'style-dictionary-esm',
    'jiti',
    'chalk',
    'pathe',
    'magic-string',
    'json5',
  ],
  onSuccess: 'npm run build:fix',
}
