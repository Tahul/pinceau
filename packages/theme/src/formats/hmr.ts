import type { PinceauThemeFormat } from '../types'

/**
 * HMR in development from '$pinceau/hmr'
 */
export const hmrFormat: PinceauThemeFormat = {
  importPath: '$pinceau/hmr',
  virtualPath: '/__pinceau_hmr.ts',
  destination: 'hmr.ts',
  formatter() {
    return `import { updateStyle } from \'/@vite/client\'\n

if (import.meta.hot) {
  import.meta.hot.on(
    \'pinceau:theme\',
    theme => {
      console.log({ theme })
      theme?.css && updateStyle(\'pinceau.css\', theme.css)
    }
  )
}`
  },
}
