/**
 * To be extended by Pinceau plugins.
 */
export interface PinceauPluginsOptions {}

/**
 * Options format used from implementation, normalized from PinceauUserOptions.
 */
export interface PinceauOptions extends FinalOptionsScope<PinceauPluginsOptions> {
  cwd: string
  dev: boolean
  debug: boolean | 2
  [key: string]: any
}

/**
 * Options format supplied by Pinceau users.
 */
export interface PinceauUserOptions extends UserOptionsScope<PinceauPluginsOptions> {
  /**
   * The root directory of your project.
   *
   * @default process.cwd()
   */
  cwd?: string

  /**
   * Toggles the development mode of Pinceau.
   */
  dev?: boolean

  /**
   * Enables extra logging.
   */
  debug?: boolean | 2

  /**
   * Extendable from integrations and plugins.
   */
  [key: string]: any
}

type UserOptionsScope<T extends object> = {
  [K in keyof T]?: T[K] extends {} ? Partial<T[K]> : T[K]
}

type FinalOptionsScope<T extends object> = {
  [K in keyof T]: T[K] extends {} ? Required<Exclude<T[K], boolean>> : T[K]
}
