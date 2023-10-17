import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      input: 'src/index.ts',
      name: 'index',
    },
  ],
  clean: true,
  declaration: false,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
})
