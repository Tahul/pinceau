import { updateStyle } from '/@vite/client'


if (import.meta.hot) {
  import.meta.hot.on(
    'pinceau:theme',
    theme => {
      console.log({ theme })
      theme?.css && updateStyle('pinceau.css', theme.css)
    }
  )
}