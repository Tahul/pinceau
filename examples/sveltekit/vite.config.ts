import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig, searchForWorkspaceRoot } from 'vite'

const root = resolve(fileURLToPath(import.meta.url), '../../../')

export default defineConfig({
  plugins: [
    sveltekit(),
  ],
  server: {
    fs: {
      allow: [
        // search up for workspace root
        root,
      ],
    },
  },
})
