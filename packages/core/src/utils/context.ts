import type { ViteDevServer } from 'vite'
import type { PinceauTheme, PinceauUtils } from '@pinceau/theme'
import type { PinceauBuildContext, PinceauContext, PinceauOptions, PinceauQuery, PinceauTransformer } from '../types'
import { parsePinceauQuery } from './query'
import { usePinceauVirtualStore } from './virtual'
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
   * Available custom parsers for SFC formats support.
   */
  const transformers: { [key: string]: PinceauTransformer } = {}

  /**
   * Track list of module queries that got through any kind of Pinceau transforms.
   */
  const transformed: { [key: string]: PinceauQuery } = {}

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
    transformers,
    registerTransformer(key: string, transformer: PinceauTransformer) { transformers[key] = transformer },
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
    get transformed() { return transformed },
    isTransformable(id: string): PinceauQuery | void {
      const included = isIncluded(id)
      if (included) { return parsePinceauQuery(id) }
    },
    addTransformed: (id: string, query?: PinceauQuery) => {
      if (!transformed[id] && query) { transformed[id] = query }
      return transformed
    },
  }

  return {
    /**
     * Main build-time $tokens helper.
     */
    get $tokens() {
      return createTokensHelper(buildContext.theme, {
        cb(ctx) {
          if (!ctx?.token) { console.log('token not found!', ctx) }
        },
      })
    },
    ...buildContext,
    ...virtualContext,
  }
}
