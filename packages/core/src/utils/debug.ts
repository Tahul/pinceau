import type { PinceauOptions } from '../types'

type DebugLevel = PinceauOptions['debug']

interface DebugContext { logger: any; debugLevel: DebugLevel; tag: any; info: any; warning: any; error: any; success: any }

let context: DebugContext = {
  // consola.withScope(' 🖌 ')
  logger: console,
  // false
  debugLevel: false,
  // chalk.bgBlue.blue
  tag: noopHelper,
  // chalk.blue
  info: noopHelper,
  // chalk.yellow
  warning: noopHelper,
  // chalk.red
  error: noopHelper,
  // chalk.green
  success: noopHelper,
}

function updateDebugContext(newContext: Partial<DebugContext>) {
  context = {
    ...context,
    ...newContext,
  }
}

function getDebugContext() {
  return context
}

const c = getDebugContext

// Custom exposed helpers
function fileLink(id: string) {
  return c().logger.log(`🔗 ${c().info(id)}\n`)
}

function errorMessage(message: string) {
  return c().logger.log(`🚧 ${c().warning(message)}\n`)
}

function DEBUG_MARKER() {
  return c().tag(' DEBUG ')
}

function debugMarker(text, timing) {
  return c().logger.info(`${DEBUG_MARKER()} ${text} ${timing ? `[${timing}ms]` : ''}`)
}

// All available messages
const messages = {
  /**
   * Errors
   */

  TRANSFORM_ERROR: (_debugLevel, id, error) => {
    c().logger.error('Pinceau could not transform this file:')
    fileLink(id)
    error?.message && errorMessage(error.message)
  },
  CONFIG_RESOLVE_ERROR: (_debugLevel, path, error) => {
    c().logger.error('Pinceau could not resolve this configuration file:')
    const loc = error?.loc?.start?.line ? `${error.loc.start.line}:${error.loc.start.column}` : ''
    fileLink(`${path}${loc}`)
    error?.message && errorMessage(error.message)
  },
  CONFIG_BUILD_ERROR: (_debugLevel, error) => {
    c().logger.error('Pinceau could not build your design tokens configuration!\n')
    c().logger.log(error)
  },
  SELECTOR_CONFLICT: (_debugLevel, selector) => {
    c().logger.warn('Pinceau detected a conflicting selector:')
    c().logger.log(`❓ ${selector}\n`)
    c().logger.log('If you want to combine `@dark` or `@light` with `html` selector, consider using `html.dark` or `html.light`.\n')
  },
  UTIL_NAME_CONFLICT: (_debugLevel, name) => {
    c().logger.warn('Pinceau detected a conflicting util name:')
    c().logger.log(`❓ ${name}\n`)
    c().logger.log('Util properties must be valid const names.\n')
    c().logger.log('Learn more about `const` name limitations: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types\n')
  },
  WRONG_TOKEN_NAMING: (_debugLevel, token) => {
    c().logger.error(`Pinceau detected an invalid token name: ${c().error(token?.path?.join('-') || 'Unknown path!')}`)
    c().logger.log('Token paths can not contains the following characters: `.` or `-`\n')
    c().logger.log('These paths keys also has to only contains characters supported in CSS stylesheets.\n')
  },

  /**
   * Warnings (debugLevel >= 1)
   */

  CONFIG_RESOLVED: (debugLevel, resolvedConfig) => {
    if (debugLevel === 2) {
      c().logger.log('✅ Pinceau loaded with following configuration sources:\n')
      resolvedConfig.sources.forEach(path => fileLink(path))
      c().logger.log('🚧 Disable this message by setting `debug: false` option.\n')
      c().logger.log(`🚧 Current debug level: ${c().info(Number(debugLevel))}\n`)
    }
  },
  TOKEN_NOT_FOUND: (debugLevel, path, options) => {
    if (debugLevel && options?.loc?.query && !(options.loc.query?.type)) {
      c().logger.warn(`Token not found in static CSS: ${c().error(path)}`)

      // Get LOC for missing token in `css({ ... })`
      const { line: lineOffset, column: columnOffset } = findLineColumn(options.loc.source, `{${path}}`)

      // Not LOC provided by parser, try guessing `css({ ... })` position in whole code
      if (!options.loc?.start) { options.loc.start = findLineColumn(options.loc.source, 'css({') }

      // Concat lines
      const line = (options.loc?.start?.line || 0) + lineOffset
      const column = (options.loc?.start?.column || 0) + columnOffset

      c().logger.log(`🔗 ${options.loc.query.filename}${(line && column) ? `:${line}:${column}\n` : ''}`)
    }
  },
  SCHEMA_BUILD_ERROR: (debugLevel, _) => {
    if (debugLevel) {
      c().logger.warn('Pinceau could not build your schema.ts file!')
      c().logger.log('Design tokens editor might be hidden from Nuxt Studio.')
    }
  },
  RUNTIME_FEATURES_CONFLICT: (debugLevel, id) => {
    if (debugLevel) {
      c().logger.error('This component uses runtime features even though `runtime` is set to false in options:')
      fileLink(id)
    }
  },
} as const

type Messages = typeof messages

type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never

function message <T extends keyof Messages>(id: T, options?: DropFirst<Parameters<Messages[T]>>) {
  return messages[id].bind(undefined, c().debugLevel, ...options as any)()
}

function noopHelper(value: string | number) {
  return value?.toString() || value
}

function findLineColumn(content, index) {
  const lines = content.split('\n')

  let line
  let column

  lines.forEach((lineContent, lineIndex) => {
    if (lineContent.includes(index)) {
      line = lineIndex
      column = lineContent.indexOf(index) + 1
    }
  })

  return {
    line,
    column,
  }
}

export { message, updateDebugContext, getDebugContext, debugMarker, fileLink, errorMessage }
