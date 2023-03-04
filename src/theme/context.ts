import type { ViteDevServer } from 'vite'
import { useDebugPerformance } from '../utils/debug'
import { message } from '../utils/logger'
import type { PinceauBuildContext, PinceauContext, PinceauOptions, PinceauTheme } from '../types'
import { createTokensHelper } from '../utils/$tokens'
import { generateTheme } from './generate'
import { usePinceauConfigContext } from './config'
import { usePinceauVirtualStore } from './virtual'

/**
 * Creates the Pinceau context from the options.
 */
export function usePinceauContext(options: PinceauOptions): PinceauContext {
  /**
   * Track list of files that got through Pinceau transforms.
   */
  let transformed: string[] = []

  /**
   * Current reference of built theme tokens.
   */
  let tokens: PinceauTheme

  /**
   * Local reference to the Vite development server attached to Pinceau.
   */
  let viteServer: ViteDevServer

  const buildContext: PinceauBuildContext = {
    env: 'prod',
    options,
    runtime: false,
    get tokens() { return tokens },
    get viteServer() { return viteServer },
    set viteServer(v: ViteDevServer) { viteServer = v },
    set transformed(v: string[]) { transformed = v },
    get transformed() { return transformed },
    addTransformed: (id: string) => !transformed.includes(id) && transformed.push(id),
  }

  // Virtual storage
  const virtualContext = usePinceauVirtualStore()

  // Configuration
  const configContext = usePinceauConfigContext(
    buildContext,
    async (resolvedConfig) => {
      message('CONFIG_RESOLVED', [resolvedConfig])

      const { stopPerfTimer } = useDebugPerformance('Build theme', options.debug)

      const builtTheme = await generateTheme(resolvedConfig, buildContext)

      if (builtTheme.outputs) { virtualContext.updateOutputs(builtTheme.outputs) }

      if (builtTheme.tokens) { tokens = builtTheme.tokens as PinceauTheme }

      if (options?.configBuilt) { await options.configBuilt(builtTheme) }

      if (viteServer) {
        viteServer.ws.send({
          type: 'custom',
          event: 'pinceau:themeUpdate',
          data: {
            css: builtTheme.outputs.css,
            theme: builtTheme.tokens,
          },
        })
      }

      stopPerfTimer()
    },
  )

  return {
    ...buildContext,
    ...configContext,
    ...virtualContext,
    get $tokens() {
      return createTokensHelper(
        buildContext.tokens,
        {
          onNotFound(path, options) {
            message('TOKEN_NOT_FOUND', [path, options])
          },
        },
      )
    },
  }
}
