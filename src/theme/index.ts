import type { ViteDevServer } from 'vite'
import { useDebugPerformance } from '../utils/debug'
import { message } from '../utils/logger'
import type { PinceauContext, PinceauOptions } from '../types'
import { createTokensHelper } from '../utils/$tokens'
import { generateTheme } from './generate'
import { usePinceauConfig } from './config'
import { usePinceauVirtualStore } from './virtual'
import { prepareOutputDir } from './output'

/**
 * Creates the Pinceau context from the options.
 */
export const createContext = <UserOptions extends PinceauOptions = PinceauOptions>(options: UserOptions): PinceauContext<UserOptions> => {
  const env: PinceauContext['env'] = 'prod'

  // Context state
  const transformed: string[] = []
  const getTransformed = () => transformed
  let viteServer: ViteDevServer
  const getViteServer = () => viteServer
  let tokens = {}
  const getTokens = () => tokens
  let customProperties: any = {}
  const getCustomProperties = () => customProperties

  // Prepares the output dir
  prepareOutputDir(options)

  // Virtual storage
  const { outputs, getOutput, getOutputId, updateOutputs } = usePinceauVirtualStore()

  // Configuration
  const configContext = usePinceauConfig<UserOptions>(
    options,
    getViteServer,
    getTransformed,
    async (resolvedConfig) => {
      message('CONFIG_RESOLVED', [resolvedConfig])

      const { stopPerfTimer } = useDebugPerformance('Build theme', options.debug)

      // Preserve custom properties in memory to avoid virtual storage call on compile
      customProperties = (resolvedConfig.config as any)?.utils || {}

      const builtTheme = await generateTheme(resolvedConfig.config, options)
      if (!builtTheme) {
        stopPerfTimer()
        return
      }

      updateOutputs(builtTheme)

      // Update local tokens
      tokens = builtTheme.tokens

      if (viteServer) {
        viteServer.ws.send({
          type: 'custom',
          event: 'pinceau:themeUpdate',
          data: {
            theme: flattenTokens(tokens),
            customProperties: getCustomProperties(),
          },
        })
      }

      stopPerfTimer()
    },
  )

  return {
    // Local context
    env,
    options,

    // Transformed files
    get transformed() {
      return getTransformed()
    },
    addTransformed(id: string) {
      if (!transformed.includes(id)) { transformed.push(id) }
    },

    // $tokens
    get tokens() {
      return getTokens()
    },
    get $tokens() {
      return createTokensHelper(
        tokens,
        {
          onNotFound(path, options) {
            message('TOKEN_NOT_FOUND', [path, options])
          },
        },
      )
    },

    // customProperties
    get customProperties() {
      return getCustomProperties()
    },

    // Vite
    get viteServer() {
      return getViteServer()
    },
    setViteServer: (server: ViteDevServer) => {
      viteServer = server
      configContext.registerConfigWatchers()
    },

    // Config
    ...configContext,

    // Virtual storage
    outputs,
    getOutput,
    updateOutputs,
    getOutputId,
  }
}
