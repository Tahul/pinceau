/* eslint-disable n/prefer-global/process */

export const PC_ATTR: string
  = (typeof process !== 'undefined'
    && typeof process.env !== 'undefined'
    && (process.env.PC_ATTR))
  || 'data-pinceau'

export const PC_ATTR_ACTIVE = 'active'
export const PC_ATTR_VERSION = 'data-pinceau-version'
export const PC_VERSION = '1.0.0'
export const SPLITTER = '/*!pc*/\n'

export const IS_BROWSER = typeof window !== 'undefined' && 'HTMLElement' in window

// Shared empty execution context when generating static styles
export const STATIC_EXECUTION_CONTEXT = {}
