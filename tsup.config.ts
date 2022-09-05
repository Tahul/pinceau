import type { Options } from 'tsup'

export default <Options>{
  entryPoints: [
    'src/*.ts',
  ],
  clean: true,
  format: ['cjs', 'esm'],
  dts: true,
  external: ['vite', '#pinceau', '#pinceau/types', '@nuxt/schema', '@nuxt/kit'],
  onSuccess: 'npm run build:fix',
}
