import type { PinceauOptions } from 'pinceau/types'
import { findLineColumn } from './debug'

type DebugLevel = PinceauOptions['debug']

// Setup context
const noopHelper = (value: string | number) => value?.toString() || value
let context: { logger: any; debugLevel: DebugLevel; tag: any; info: any; warning: any; error: any; success: any } = {
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
const updateDebugContext = (newContext: Partial<typeof context>) => {
  context = {
    ...context,
    ...newContext,
  }
  console.log({ context })
}
const getDebugContext = () => context
const c = getDebugContext

// Custom exposed helpers
const fileLink = (id: string) => c().logger.log(`🔗 ${c().info(id)}\n`)
const errorMessage = (message: string) => c().logger.log(`🚧 ${c().warning(message)}\n`)
const DEBUG_MARKER = () => c().tag(' DEBUG ')
const debugMarker = (text, timing) => c().logger.info(`${DEBUG_MARKER()} ${text} ${timing ? `[${timing}ms]` : ''}`)

// All available messages
const messages = {
  TRANSFORM_ERROR: (debugLevel, id, error) => {
    c().logger.error('Pinceau could not transform this file:')
    fileLink(id)
    error?.message && errorMessage(error.message)
  },
  CONFIG_RESOLVE_ERROR: (debugLevel, path, error) => {
    c().logger.error('Pinceau could not resolve this configuration file:')
    const loc = error?.loc?.start?.line ? `${error.loc.start.line}:${error.loc.start.column}` : ''
    fileLink(`${path}${loc}`)
    error?.message && errorMessage(error.message)
  },
  CONFIG_BUILD_ERROR: (debugLevel, error) => {
    c().logger.error('Pinceau could not build your design tokens configuration!\n')
    c().logger.log(error)
  },
  CONFIG_RESOLVED: (debugLevel, resolvedConfig) => {
    if (debugLevel) {
      c().logger.log('🎨 Pinceau loaded with following configuration sources:\n')
      resolvedConfig.sources.forEach(path => fileLink(path))
      c().logger.log('🚧 Disable this message by setting `debug: false` option.\n')
      c().logger.log(`🚧 Current debug level: ${c().info(Number(debugLevel))}\n`)
    }
  },
  TOKEN_NOT_FOUND: (debugLevel, path, options) => {
    if (options?.loc?.query && !(options.loc.query?.type)) {
      c().logger.warn(`Token not found in static CSS: ${c().error(path)}`)

      // Get LOC for missing token in `css({ ... })`
      const { line: lineOffset, column: columnOffset } = findLineColumn(options.loc.source, `{${path}}`)
      // Not LOC provided by parser, try guessing `css({ ... })` position in whole code
      if (!options.loc?.start) { options.loc.start = findLineColumn(options.loc.source, 'css({') }

      // Concat lines
      const line = (options.loc?.start?.line || 0) + lineOffset
      const column = (options.loc?.start?.column || 0) + columnOffset

      c().logger.log(`🔗 ${options.loc.query.filename}${line && column ? `:${line}:${column}\n` : ''}`)
    }
  },
  SELECTOR_CONFLICT: (debugLevel, selector) => {
    c().logger.warn('You seem to be using a conflicting selector:')
    c().logger.log(`❓ ${selector}\n`)
    c().logger.log('If you want to combine `@dark` or `@light` with `html` selector, consider using `html.dark` or `html.light`.\n')
  },
  WRONG_TOKEN_NAMING: (debugLevel, token) => {
    c().logger.error(`Invalid token name: ${c().error(token.path.join('-'))}`)
    c().logger.log('Token paths can not contains the following characters: `.` or `-`\n')
    c().logger.log('These paths keys also has to only contains characters supported in CSS stylesheets.\n')
  },
  SCHEMA_BUILD_ERROR: (debugLevel, _) => {
    if (debugLevel) {
      c().logger.warn('Pinceau could not build your schema.ts file!')
      c().logger.log('Design tokens editor might be hidden from Nuxt Studio.')
    }
  },
} as const

type Messages = typeof messages

type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never

const message = <T extends keyof Messages>(id: T, options?: DropFirst<Parameters<Messages[T]>>) => {
  console.log({ id, options })
  return messages[id].bind(undefined, c().debugLevel, ...options)()
}

export { message, updateDebugContext, getDebugContext, debugMarker, fileLink, errorMessage }
