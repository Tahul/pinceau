import chalk from 'chalk'
import consola from 'consola'
import type { PinceauOptions } from 'pinceau/types'
import { findLineColumn } from './debug'

type DebugLevel = PinceauOptions['debug']

let debugLevel: DebugLevel = false

const setDebugLevel = (newDebugLevel: DebugLevel) => (debugLevel = newDebugLevel)
const getDebugLevel = () => debugLevel

const logger = consola.withScope(' 🖌 ')

export const fileLink = (id: string) => logger.log(`🔗 ${chalk.blue(id)}\n`)
export const errorMessage = (message: string) => logger.log(`🚧 ${chalk.yellow(message)}\n`)
const DEBUG_MARKER = chalk.bgBlue.blue(' DEBUG ')
export const debugMarker = (text, timing) => logger.info(`${DEBUG_MARKER} ${text} [${timing}ms]`)

const messages = {
  TRANSFORM_ERROR: (debugLevel, id, error) => {
    logger.error('Pinceau could not transform this file:')
    fileLink(id)
    error?.message && errorMessage(error.message)
  },
  CONFIG_RESOLVE_ERROR: (debugLevel, path, error) => {
    logger.error('Pinceau could not resolve this configuration file:')
    const loc = error?.loc?.start?.line ? `${error.loc.start.line}:${error.loc.start.column}` : ''
    fileLink(`${path}${loc}`)
    error?.message && errorMessage(error.message)
  },
  CONFIG_BUILD_ERROR: (debugLevel, error) => {
    logger.error('Pinceau could not build your design tokens configuration!\n')
    logger.log(error)
  },
  CONFIG_RESOLVED: (debugLevel, resolvedConfig) => {
    if (debugLevel) {
      logger.log('🎨 Pinceau loaded with following configuration sources:\n')
      resolvedConfig.sources.forEach(path => fileLink(path))
      logger.log('🚧 Disable this message by setting `debug: false` option.\n')
      logger.log(`🚧 Current debug level: ${chalk.blue(Number(debugLevel))}\n`)
    }
  },
  TOKEN_NOT_FOUND: (debugLevel, path, options) => {
    if (options?.loc?.query && !(options.loc.query?.type)) {
      logger.warn(`Token not found: ${path}`)

      // Get LOC for missing token in `css({ ... })`
      const { line: lineOffset, column: columnOffset } = findLineColumn(options.loc.source, `{${path}}`)
      // Not LOC provided by parser, try guessing `css({ ... })` position in whole code
      if (!options.loc?.start) { options.loc.start = findLineColumn(options.loc.source, 'css({') }

      // Concat lines
      const line = (options.loc?.start?.line || 0) + lineOffset
      const column = (options.loc?.start?.column || 0) + columnOffset

      logger.log(`🔗 ${options.loc.query.filename}${line && column ? `:${line}:${column}\n` : ''}`)
    }
  },
} as const

type Messages = typeof messages

type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never

const message = <T extends keyof Messages>(id: T, options?: DropFirst<Parameters<Messages[T]>>) => messages[id].bind(undefined, getDebugLevel(), ...options)()

export { message, logger, setDebugLevel, getDebugLevel }
