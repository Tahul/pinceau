import type { ViteDevServer } from 'vite'
import type { PinceauContext, PinceauOptions, PinceauTheme } from '../types'
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
  let tokens: PinceauTheme = {} as any as PinceauTheme
  let viteServer: ViteDevServer

  // Prepares the output dir (TODO: remove it to only depend on in-memory storage)
  prepareOutputDir(options)

  const { outputs, getOutput, getOutputId, updateOutputs } = usePinceauVirtualStore()

  const configContext = usePinceauConfig<UserOptions>(
    options,
    async (resolvedConfig) => {
      const builtTheme = await generateTheme(resolvedConfig.config, options.outputDir as string)

      updateOutputs(builtTheme)

      tokens = builtTheme.tokens
    },
  )

  const context = {
    // Local context
    env,
    get tokens() {
      return tokens
    },
    get $tokens() {
      return createTokensHelper(tokens, getOutput('aliases'))
    },

    // Vite
    get viteServer() {
      return viteServer
    },
    setViteServer: (server: ViteDevServer) => (viteServer = server),

    // Config
    ...configContext,

    // Virtual storage
    outputs,
    getOutput,
    updateOutputs,
    getOutputId,
  }

  return context
}
