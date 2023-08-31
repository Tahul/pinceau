import { updateStyle } from '/@vite/client'


if (import.meta.hot) {
  // Theme updates
  import.meta.hot.on(
    'pinceau:theme',
    theme => {
      theme?.css && updateStyle('pinceau.css', theme.css)
    }
  )

  // CSS Functions updates
  import.meta.hot.on(
    'pinceau:style-function',
    ({ filename, id, css }) => {
      console.log({ filename, id, css })

      // Find the target node
      const node = document.querySelector(`style[data-vite-dev-id*="pinceau-style-function"][data-vite-dev-id*="${id}"]`)
      if (!node) return
      
      // Find the target node data-vite-dev-id
      const nodeId = node?.attributes?.['data-vite-dev-id']?.value
      if (!nodeId) return

      console.log({ node, nodeId })

      // Update that node style
      updateStyle(nodeId, css)
    }
  )
}