import { defineConfig } from 'vite'
import ViteInspector from 'vite-plugin-inspect'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/my-element.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: /^lit/,
    },
  },
  plugins: [
    ViteInspector(),
  ],
})
