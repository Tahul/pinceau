import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      input: 'src/index.ts',
      name: 'index',
      format: 'esm'
    }
  ],
  failOnWarn: false,
  clean: true,
  declaration: false,
  rollup: {
    emitCJS: true,
    inlineDependencies: true
  }
})
