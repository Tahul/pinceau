import { defineConfig } from 'vitest/config'
import { alias } from './aliases'

export default defineConfig({
  resolve: {
    alias,
  },

  test: {
    globals: true,
    watch: true,
    include: ['fixtures/*.fixture.ts'],
    coverage: { enabled: false },
  },
})
