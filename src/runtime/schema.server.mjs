import { defineNuxtPlugin, useRequestEvent } from '#imports'
import theme from '#build/pinceau/index'
import { schema } from '#build/pinceau/schema'

export default defineNuxtPlugin(() => {
  const event = useRequestEvent()
  if (event.path === '/__pinceau_tokens_config.json') {
    event.node.res.setHeader('Content-Type', 'application/json')
    event.node.res.statusCode = 200
    event.node.res.end(JSON.stringify(theme, null, 2))
  }
  if (event.path === '/__pinceau_tokens_schema.json') {
    event.node.res.setHeader('Content-Type', 'application/json')
    event.node.res.statusCode = 200
    event.node.res.end(JSON.stringify(schema, null, 2))
  }
})
