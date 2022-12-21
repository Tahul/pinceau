import { defineNuxtPlugin, useRequestEvent } from '#imports'
import theme from '#build/pinceau/index'

export default defineNuxtPlugin(() => {
  const event = useRequestEvent()
  if (event.path === '/__tokens_config.json') {
    event.node.res.setHeader('Content-Type', 'application/json')
    event.node.res.statusCode = 200
    event.node.res.end(JSON.stringify(theme, null, 2))
  }
})
