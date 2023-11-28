import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import { alias } from './aliases'

export default defineConfig({
  resolve: {
    alias,
  },

  test: {
    globals: true,
    watch: true,
    include: ['unit/*.test.ts'],
    coverage: {
      enabled: false,
      reporter: ['text', 'json', 'html'],
      allowExternal: true,
      include: [
        resolve(__dirname, '../packages/**/src/**/*'),
        resolve(__dirname, '../integrations/**/src/**/*'),
      ],
      exclude: ['../examples/**/*', '../node_modules/**/*'],
      clean: true,
      all: true,
    },
  },
})
