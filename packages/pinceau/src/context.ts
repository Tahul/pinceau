import type { ViteDevServer } from 'vite'
import type { PinceauBuildContext, PinceauContext, PinceauOptions, PinceauQuery, PinceauTheme, PinceauUtils } from '@pinceau/shared'
import { createTokensHelper, message, parsePinceauQuery } from '@pinceau/shared'
import { usePinceauVirtualStore } from './virtual'

/**
 * Creates the Pinceau context from the options.
 */
export function usePinceauContext(options: PinceauOptions): PinceauContext {
  /**
   * Track list of module queries that got through any kind of Pinceau transforms.
   */
  const transformed: { [key: string]: PinceauQuery | undefined } = {}

  /**
   * Track list of module queries that got loaded through Pinceau.
   *
   * Usually it will be SFC blocks queries.
   */
  const loaded: { [key: string]: PinceauQuery | undefined } = {}

  /**
   * Current reference of built theme.
   */
  let theme: PinceauTheme

  /**
   * Current reference of built utils properties.
   */
  let utils: PinceauUtils

  /**
   * Local reference to the Vite development server attached to Pinceau.
   */
  let viteServer: ViteDevServer

  /**
   * Virtual storage context.
   */
  const virtualContext = usePinceauVirtualStore()

  const isIncluded = (id: string): boolean | undefined => {
    let toRet: boolean | undefined = true

    // Stop on excluded paths
    if (
      options.style.excludes
        && options.style.excludes.some(path => id.includes(path))
    ) {
      toRet = false
    }

    // Includes path has higher priority than excluded path
    if (
      options.style.includes
        && options.style.includes.some(path => id.includes(path))
    ) {
      toRet = true
    }

    return toRet
  }

  /**
   * Build-time context.
   */
  const buildContext: PinceauBuildContext = {
    options,
    get theme() { return theme },
    updateTheme(_theme: any) {
      if (_theme) { theme = _theme }
      return theme
    },
    get utils() { return utils },
    updateUtils(_utils) {
      if (_utils) { utils = _utils }
      return utils
    },
    get viteServer() { return viteServer },
    updateViteServer: (server: ViteDevServer) => {
      viteServer = server
      return viteServer
    },
    get transformed() { return transformed },
    isTransformable(id: string): PinceauQuery | undefined {
      const included = isIncluded(id)

      // Use Vue's query parser
      const query = parsePinceauQuery(id)

      if (included) { return query }
    },
    addTransformed: (id: string, query?: PinceauQuery) => {
      if (!transformed[id]) { transformed[id] = query }
      return transformed
    },
    get loaded() { return loaded },
    isLoadable(id: string): PinceauQuery | undefined {
      const included = isIncluded(id)

      const query = parsePinceauQuery(id)

      if (included) { return query }
    },
    addLoaded: (id: string, query?: PinceauQuery) => {
      if (!loaded[id]) { loaded[id] = query }
      return loaded
    },
  }

  /**
   * Main build-time $tokens helper.
   */
  const $tokens = createTokensHelper(
    buildContext.theme,
    {
      onNotFound(path, options) {
        message('TOKEN_NOT_FOUND', [path, options])
      },
    },
  )

  return {
    ...buildContext,
    ...virtualContext,
    $tokens,
  }
}
