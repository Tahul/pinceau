// vite.config.ts
import { createResolver } from "file:///Users/yaelguilloux/Code/sandbox/pinceau/node_modules/.pnpm/@nuxt+kit@3.7.4_rollup@3.29.4/node_modules/@nuxt/kit/dist/index.mjs";
import { defineConfig } from "file:///Users/yaelguilloux/Code/sandbox/pinceau/node_modules/.pnpm/vite@4.4.11_@types+node@20.8.4/node_modules/vite/dist/node/index.js";
import Pinceau from "file:///Users/yaelguilloux/Code/sandbox/pinceau/integrations/vue/dist/plugin.mjs";
import vue from "file:///Users/yaelguilloux/Code/sandbox/pinceau/node_modules/.pnpm/@vitejs+plugin-vue@4.4.0_vite@4.4.11_vue@3.3.4/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import replace from "file:///Users/yaelguilloux/Code/sandbox/pinceau/node_modules/.pnpm/@rollup+plugin-replace@5.0.3_rollup@3.29.4/node_modules/@rollup/plugin-replace/dist/es/index.js";
import { nodePolyfills } from "file:///Users/yaelguilloux/Code/sandbox/pinceau/node_modules/.pnpm/vite-plugin-node-polyfills@0.15.0_rollup@3.29.4_vite@4.4.11/node_modules/vite-plugin-node-polyfills/dist/index.js";
var __vite_injected_original_import_meta_url = "file:///Users/yaelguilloux/Code/sandbox/pinceau/integrations/repl/vite.config.ts";
var resolve = (p) => createResolver(__vite_injected_original_import_meta_url).resolve(p);
var genStub = {
  name: "gen-stub",
  apply: "build",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "ssr-stub.js",
      source: "module.exports = {}"
    });
  }
};
var vite_config_default = defineConfig(
  {
    resolve: {
      alias: {
        "path": "path-browserify",
        "@vue/compiler-dom": "@vue/compiler-dom/dist/compiler-dom.cjs.js",
        "@vue/compiler-core": "@vue/compiler-core/dist/compiler-core.cjs.js",
        "@pinceau/stringify": resolve("../../packages/stringify/src/index.ts"),
        "@pinceau/runtime": resolve("../../packages/runtime/src/index.ts"),
        "@pinceau/core/runtime": resolve("../../packages/core/src/runtime.ts"),
        "@pinceau/theme/runtime": resolve("../../packages/theme/src/runtime.ts"),
        "@pinceau/vue/runtime": resolve("../../integrations/vue/src/runtime.ts")
      }
    },
    plugins: [
      genStub,
      nodePolyfills(),
      Pinceau({
        style: {
          excludes: [
            resolve("../../packages"),
            "node_modules/**/*"
          ]
        },
        theme: {
          buildDir: resolve("./node_modules/.pinceau"),
          layers: [
            {
              path: resolve("../../packages/palette/")
            }
          ]
        }
      }),
      vue()
    ],
    optimizeDeps: {
      // avoid late discovered deps
      include: [
        "path-browserify",
        "onigasm",
        "typescript",
        "@volar/cdn",
        "@vue/language-service",
        "monaco-editor/esm/vs/editor/editor.worker",
        "@volar/monaco/worker",
        "vue/server-renderer",
        "svelte",
        "react"
      ]
    },
    base: "./",
    build: {
      target: "esnext",
      minify: false,
      commonjsOptions: {
        ignore: ["typescript"]
      },
      lib: {
        entry: {
          "vue-repl": "./src/index.ts",
          "monaco-editor": "./src/components/editor/MonacoEditor.vue"
        },
        formats: ["es"],
        fileName: () => "[name].js"
      },
      rollupOptions: {
        output: {
          chunkFileNames: "chunks/[name]-[hash].js"
        },
        external: ["vue", "vue/compiler-sfc"]
      },
      worker: {
        format: "es",
        plugins: [
          replace({
            preventAssignment: true,
            values: {
              "process.env.NODE_ENV": JSON.stringify("production")
            }
          })
        ]
      }
    }
  }
);
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMveWFlbGd1aWxsb3V4L0NvZGUvc2FuZGJveC9waW5jZWF1L2ludGVncmF0aW9ucy9yZXBsXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMveWFlbGd1aWxsb3V4L0NvZGUvc2FuZGJveC9waW5jZWF1L2ludGVncmF0aW9ucy9yZXBsL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy95YWVsZ3VpbGxvdXgvQ29kZS9zYW5kYm94L3BpbmNlYXUvaW50ZWdyYXRpb25zL3JlcGwvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBjcmVhdGVSZXNvbHZlciB9IGZyb20gJ0BudXh0L2tpdCdcbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSdcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgUGluY2VhdSBmcm9tICdAcGluY2VhdS92dWUvcGx1Z2luJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgcmVwbGFjZSBmcm9tICdAcm9sbHVwL3BsdWdpbi1yZXBsYWNlJ1xuaW1wb3J0IHsgbm9kZVBvbHlmaWxscyB9IGZyb20gJ3ZpdGUtcGx1Z2luLW5vZGUtcG9seWZpbGxzJ1xuXG5jb25zdCByZXNvbHZlID0gKHA6IHN0cmluZykgPT4gY3JlYXRlUmVzb2x2ZXIoaW1wb3J0Lm1ldGEudXJsKS5yZXNvbHZlKHApXG5cbmNvbnN0IGdlblN0dWI6IFBsdWdpbiA9IHtcbiAgbmFtZTogJ2dlbi1zdHViJyxcbiAgYXBwbHk6ICdidWlsZCcsXG4gIGdlbmVyYXRlQnVuZGxlKCkge1xuICAgIHRoaXMuZW1pdEZpbGUoe1xuICAgICAgdHlwZTogJ2Fzc2V0JyxcbiAgICAgIGZpbGVOYW1lOiAnc3NyLXN0dWIuanMnLFxuICAgICAgc291cmNlOiAnbW9kdWxlLmV4cG9ydHMgPSB7fScsXG4gICAgfSlcbiAgfSxcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAncGF0aCc6ICdwYXRoLWJyb3dzZXJpZnknLFxuICAgICAgJ0B2dWUvY29tcGlsZXItZG9tJzogJ0B2dWUvY29tcGlsZXItZG9tL2Rpc3QvY29tcGlsZXItZG9tLmNqcy5qcycsXG4gICAgICAnQHZ1ZS9jb21waWxlci1jb3JlJzogJ0B2dWUvY29tcGlsZXItY29yZS9kaXN0L2NvbXBpbGVyLWNvcmUuY2pzLmpzJyxcbiAgICAgICdAcGluY2VhdS9zdHJpbmdpZnknOiByZXNvbHZlKCcuLi8uLi9wYWNrYWdlcy9zdHJpbmdpZnkvc3JjL2luZGV4LnRzJyksXG4gICAgICAnQHBpbmNlYXUvcnVudGltZSc6IHJlc29sdmUoJy4uLy4uL3BhY2thZ2VzL3J1bnRpbWUvc3JjL2luZGV4LnRzJyksXG4gICAgICAnQHBpbmNlYXUvY29yZS9ydW50aW1lJzogcmVzb2x2ZSgnLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcnVudGltZS50cycpLFxuICAgICAgJ0BwaW5jZWF1L3RoZW1lL3J1bnRpbWUnOiByZXNvbHZlKCcuLi8uLi9wYWNrYWdlcy90aGVtZS9zcmMvcnVudGltZS50cycpLFxuICAgICAgJ0BwaW5jZWF1L3Z1ZS9ydW50aW1lJzogcmVzb2x2ZSgnLi4vLi4vaW50ZWdyYXRpb25zL3Z1ZS9zcmMvcnVudGltZS50cycpLFxuICAgIH0sXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICBnZW5TdHViLFxuICAgIG5vZGVQb2x5ZmlsbHMoKSxcbiAgICBQaW5jZWF1KHtcbiAgICAgIHN0eWxlOiB7XG4gICAgICAgIGV4Y2x1ZGVzOiBbXG4gICAgICAgICAgcmVzb2x2ZSgnLi4vLi4vcGFja2FnZXMnKSxcbiAgICAgICAgICAnbm9kZV9tb2R1bGVzLyoqLyonLFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIHRoZW1lOiB7XG4gICAgICAgIGJ1aWxkRGlyOiByZXNvbHZlKCcuL25vZGVfbW9kdWxlcy8ucGluY2VhdScpLFxuICAgICAgICBsYXllcnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBwYXRoOiByZXNvbHZlKCcuLi8uLi9wYWNrYWdlcy9wYWxldHRlLycpLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIH0pIGFzIGFueSxcbiAgICB2dWUoKSxcbiAgXSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgLy8gYXZvaWQgbGF0ZSBkaXNjb3ZlcmVkIGRlcHNcbiAgICBpbmNsdWRlOiBbXG4gICAgICAncGF0aC1icm93c2VyaWZ5JyxcbiAgICAgICdvbmlnYXNtJyxcbiAgICAgICd0eXBlc2NyaXB0JyxcbiAgICAgICdAdm9sYXIvY2RuJyxcbiAgICAgICdAdnVlL2xhbmd1YWdlLXNlcnZpY2UnLFxuICAgICAgJ21vbmFjby1lZGl0b3IvZXNtL3ZzL2VkaXRvci9lZGl0b3Iud29ya2VyJyxcbiAgICAgICdAdm9sYXIvbW9uYWNvL3dvcmtlcicsXG4gICAgICAndnVlL3NlcnZlci1yZW5kZXJlcicsXG4gICAgICAnc3ZlbHRlJyxcbiAgICAgICdyZWFjdCcsXG4gICAgXSxcbiAgfSxcbiAgYmFzZTogJy4vJyxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlc25leHQnLFxuICAgIG1pbmlmeTogZmFsc2UsXG4gICAgY29tbW9uanNPcHRpb25zOiB7XG4gICAgICBpZ25vcmU6IFsndHlwZXNjcmlwdCddLFxuICAgIH0sXG4gICAgbGliOiB7XG4gICAgICBlbnRyeToge1xuICAgICAgICAndnVlLXJlcGwnOiAnLi9zcmMvaW5kZXgudHMnLFxuICAgICAgICAnbW9uYWNvLWVkaXRvcic6ICcuL3NyYy9jb21wb25lbnRzL2VkaXRvci9Nb25hY29FZGl0b3IudnVlJyxcbiAgICAgIH0sXG4gICAgICBmb3JtYXRzOiBbJ2VzJ10sXG4gICAgICBmaWxlTmFtZTogKCkgPT4gJ1tuYW1lXS5qcycsXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdjaHVua3MvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICB9LFxuICAgICAgZXh0ZXJuYWw6IFsndnVlJywgJ3Z1ZS9jb21waWxlci1zZmMnXSxcbiAgICB9LFxuICAgIHdvcmtlcjoge1xuICAgICAgZm9ybWF0OiAnZXMnLFxuICAgICAgcGx1Z2luczogW1xuICAgICAgICByZXBsYWNlKHtcbiAgICAgICAgICBwcmV2ZW50QXNzaWdubWVudDogdHJ1ZSxcbiAgICAgICAgICB2YWx1ZXM6IHtcbiAgICAgICAgICAgICdwcm9jZXNzLmVudi5OT0RFX0VOVic6IEpTT04uc3RyaW5naWZ5KCdwcm9kdWN0aW9uJyksXG4gICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgICBdLFxuICAgIH0sXG4gIH0gYXMgYW55LFxufSxcbilcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1csU0FBUyxzQkFBc0I7QUFFL1gsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sU0FBUztBQUNoQixPQUFPLGFBQWE7QUFDcEIsU0FBUyxxQkFBcUI7QUFOOEwsSUFBTSwyQ0FBMkM7QUFRN1EsSUFBTSxVQUFVLENBQUMsTUFBYyxlQUFlLHdDQUFlLEVBQUUsUUFBUSxDQUFDO0FBRXhFLElBQU0sVUFBa0I7QUFBQSxFQUN0QixNQUFNO0FBQUEsRUFDTixPQUFPO0FBQUEsRUFDUCxpQkFBaUI7QUFDZixTQUFLLFNBQVM7QUFBQSxNQUNaLE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxNQUNWLFFBQVE7QUFBQSxJQUNWLENBQUM7QUFBQSxFQUNIO0FBQ0Y7QUFFQSxJQUFPLHNCQUFRO0FBQUEsRUFBYTtBQUFBLElBQzFCLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLFFBQVE7QUFBQSxRQUNSLHFCQUFxQjtBQUFBLFFBQ3JCLHNCQUFzQjtBQUFBLFFBQ3RCLHNCQUFzQixRQUFRLHVDQUF1QztBQUFBLFFBQ3JFLG9CQUFvQixRQUFRLHFDQUFxQztBQUFBLFFBQ2pFLHlCQUF5QixRQUFRLG9DQUFvQztBQUFBLFFBQ3JFLDBCQUEwQixRQUFRLHFDQUFxQztBQUFBLFFBQ3ZFLHdCQUF3QixRQUFRLHVDQUF1QztBQUFBLE1BQ3pFO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBLGNBQWM7QUFBQSxNQUNkLFFBQVE7QUFBQSxRQUNOLE9BQU87QUFBQSxVQUNMLFVBQVU7QUFBQSxZQUNSLFFBQVEsZ0JBQWdCO0FBQUEsWUFDeEI7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLFFBQ0EsT0FBTztBQUFBLFVBQ0wsVUFBVSxRQUFRLHlCQUF5QjtBQUFBLFVBQzNDLFFBQVE7QUFBQSxZQUNOO0FBQUEsY0FDRSxNQUFNLFFBQVEseUJBQXlCO0FBQUEsWUFDekM7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0YsQ0FBQztBQUFBLE1BQ0QsSUFBSTtBQUFBLElBQ047QUFBQSxJQUNBLGNBQWM7QUFBQTtBQUFBLE1BRVosU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsUUFBUTtBQUFBLE1BQ1IsaUJBQWlCO0FBQUEsUUFDZixRQUFRLENBQUMsWUFBWTtBQUFBLE1BQ3ZCO0FBQUEsTUFDQSxLQUFLO0FBQUEsUUFDSCxPQUFPO0FBQUEsVUFDTCxZQUFZO0FBQUEsVUFDWixpQkFBaUI7QUFBQSxRQUNuQjtBQUFBLFFBQ0EsU0FBUyxDQUFDLElBQUk7QUFBQSxRQUNkLFVBQVUsTUFBTTtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUEsVUFDTixnQkFBZ0I7QUFBQSxRQUNsQjtBQUFBLFFBQ0EsVUFBVSxDQUFDLE9BQU8sa0JBQWtCO0FBQUEsTUFDdEM7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLFNBQVM7QUFBQSxVQUNQLFFBQVE7QUFBQSxZQUNOLG1CQUFtQjtBQUFBLFlBQ25CLFFBQVE7QUFBQSxjQUNOLHdCQUF3QixLQUFLLFVBQVUsWUFBWTtBQUFBLFlBQ3JEO0FBQUEsVUFDRixDQUFDO0FBQUEsUUFDSDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNBOyIsCiAgIm5hbWVzIjogW10KfQo=
