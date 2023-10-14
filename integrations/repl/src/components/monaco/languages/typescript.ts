import type { Language } from '@volar/language-core'
import createTsService from 'volar-service-typescript'

export const typescriptLanguage: Language = {
  createVirtualFile() {
    return undefined
  },
  updateVirtualFile() {
  },
}

export function plugin() {
  return {
    extraFileExtensions: [{ extension: 'svelte', isMixedContent: true, scriptKind: 7 }],
    watchFileExtensions: ['js', 'cjs', 'mjs', 'ts', 'cts', 'mts', 'jsx', 'tsx', 'json', 'svelte'],
    resolveConfig(config) {
      config.services ??= {}
      config.services.typescript ??= createTsService()

      config.languages ??= {}
      config.languages.typescript ??= typescriptLanguage

      return config
    },
  }
}
