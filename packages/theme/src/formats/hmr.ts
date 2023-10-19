import type { PinceauThemeFormat } from '../types'

/**
 * HMR in development from '@pinceau/outputs/hmr'
 */
export const hmrFormat: PinceauThemeFormat = {
  importPath: '@pinceau/outputs/hmr',
  virtualPath: '/__pinceau_hmr.js',
  destination: 'hmr.js',
  formatter() {
    return `import { updateStyle } from \'/@vite/client\'

if (import.meta.hot) {
  // Theme updates
  import.meta.hot.on(
    \'pinceau:theme\',
    theme => {
      theme?.css && updateStyle(\'pinceau.css\', theme.css)
    }
  )

  // CSS Functions updates
  import.meta.hot.on(
    'pinceau:style-function',
    ({ css, selector }) => {
      // Find the target node
      const node = document.querySelector(\`style\${selector}\`)
      if (!node) return
      
      // Find the target node data-vite-dev-id
      const nodeId = node?.attributes?.['data-vite-dev-id']?.value
      if (!nodeId) return

      // Update that node style
      updateStyle(nodeId, css)
    }
  )
}`
  },
}
