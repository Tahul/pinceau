import type { DtFunction } from './theme'

declare global {
  const $dt: DtFunction
  const $pinceau: string
  const __$pProps: any
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $dt: DtFunction
    $pinceau: string
  }
}

declare module '@nuxt/schema' {
  interface NuxtHooks {
    'pinceau:options': ModuleHooks['pinceau:options']
  }
  interface NuxtConfig {
    pinceau?: ModuleOptions
  }
}

export {}
