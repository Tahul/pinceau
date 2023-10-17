import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      input: 'src/index.ts',
      name: 'index',
      format: 'cjs',
    },
    {
      input: 'src/server.ts',
      name: 'server',
      format: 'cjs',
    },
  ],

  clean: true,
  declaration: false,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
    esbuild: {
      minify: true,
    },
  },
})
