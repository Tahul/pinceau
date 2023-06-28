import type { ViteDevServer } from 'vite'
import type { PinceauContext } from './types'

/**
 * Retrieves previously injected PinceauContext inside ViteDevServer to reuse context across plugins.
 */
export function getPinceauContext(server: ViteDevServer) {
  const ctx = (server as any)?._pinceauContext

  if (ctx) {
    ctx.viteServer = server
    return ctx as PinceauContext
  }

  throw new Error('You tried to use a Pinceau plugin without previously injecting the shared context.')
}
