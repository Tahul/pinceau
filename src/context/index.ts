import type { PinceauContext, PinceauOptions } from '../types'
import { prepareOutputDir, usePinceauConfig } from '../theme'
import { generateTokens } from '../theme/generate'
import { logger } from '../utils'

/**
 * Creates the Pinceau context from the options.
 */
export const createContext = <UserOptions extends PinceauOptions = PinceauOptions>(options: UserOptions): PinceauContext<UserOptions> => {
  const env: PinceauContext['env'] = 'prod'

  prepareOutputDir(options)

  const configContext = usePinceauConfig<UserOptions>(
    options,
    async (resolvedConfig) => {
      await generateTokens(resolvedConfig.config, options.outputDir as string)

      logger.success('Theme generated succesfully!')
    },
  )

  const context = {
    env,
    ...configContext,
  }

  return context
}
