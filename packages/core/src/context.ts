import type { ViteDevServer } from 'vite'
import type { PinceauTheme, PinceauUtils } from '@pinceau/theme'
import { parsePinceauQuery } from './query'
import { message } from './debug'
import { usePinceauVirtualStore } from './virtual'
import type { PinceauBuildContext, PinceauContext, PinceauOptions, PinceauQuery } from './types'
import { createTokensHelper } from './token-helper'

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

/**
 * Creates the Pinceau context from the options.
 */
export function usePinceauContext(options: PinceauOptions): PinceauContext {
  /**
   * Track list of module queries that got through any kind of Pinceau transforms.
   */
  const transformed: { [key: string]: PinceauQuery } = {}

  /**
   * Track list of module queries that got loaded through Pinceau.
   *
   * Usually it will be SFC blocks queries.
   */
  const loaded: { [key: string]: PinceauQuery } = {}

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

  const isIncluded = (id: string): boolean => {
    let toRet: boolean = true

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
    isTransformable(id: string): PinceauQuery | void {
      const included = isIncluded(id)
      if (included) { return parsePinceauQuery(id) }
    },
    addTransformed: (id: string, query?: PinceauQuery) => {
      if (!transformed[id] && query) { transformed[id] = query }
      return transformed
    },
    get loaded() { return loaded },
    isLoadable(id: string): PinceauQuery | void {
      const included = isIncluded(id)
      if (included) { return parsePinceauQuery(id) }
    },
    addLoaded: (id: string, query?: PinceauQuery) => {
      if (!loaded[id] && query) { loaded[id] = query }
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
    $tokens,
    ...buildContext,
    ...virtualContext,
  }
}
