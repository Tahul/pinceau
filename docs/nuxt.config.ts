export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
  pinceau: {
    followSymbolicLinks: false,
  },
  typescript: {
    includeWorkspace: true,
  },
})
