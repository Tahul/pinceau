import { resolve } from 'path'
import { existsSync } from 'fs'
import jiti from 'jiti'
import defu from 'defu'
import { file } from '@babel/types'
import type { PinceauOptions, PinceauTheme } from '../types'
import { logger } from '../utils'

export interface LoadConfigResult<T> {
  config: T
  sources: string[]
}

export type ConfigLayer = string | {
  cwd: string
  configFileName: string
}

export interface ResolvedConfigLayer {
  path: string | undefined
  config: any
}

const extensions = ['.js', '.ts', '.mjs', '.cjs']

export async function loadConfig<U extends PinceauTheme>(
  {
    cwd = process.cwd(),
    configOrPaths = [cwd],
    configFileName = 'pinceau.config',
  }: PinceauOptions,
): Promise<LoadConfigResult<U>> {
  let _sources: string[] = []
  let inlineConfig = {} as U

  if (Array.isArray(configOrPaths)) { _sources = configOrPaths }

  if (typeof configOrPaths === 'string') { _sources = [configOrPaths] }

  // Inline config; overwrites any other configuration
  if (Object.prototype.toString.call(configOrPaths) === '[object Object]') {
    inlineConfig = configOrPaths as U
    return { config: inlineConfig, sources: [] }
  }

  const sources: ConfigLayer[] = [
    {
      cwd,
      configFileName,
    },
    ..._sources.reduce(
      (acc: ConfigLayer[], layerOrPath: string | ConfigLayer) => {
        if (typeof layerOrPath === 'object') {
          acc.push(layerOrPath as ConfigLayer)
          return acc
        }

        // process.cwd() already gets scanned by default
        if (resolve(cwd, layerOrPath) === resolve(cwd)) { return acc }

        acc.push({
          cwd: layerOrPath,
          configFileName,
        })

        return acc
      },
      [],
    ),
  ]

  const resolveConfig = async (layer: ConfigLayer): Promise<ResolvedConfigLayer> => {
    const empty = () => {
      logger.warn('Could not find the config layer:')
      logger.warn(JSON.stringify(layer))
      return { path: undefined, config: {} }
    }

    let config = {}

    let path = ''

    // Resolve config path from layer
    if (typeof layer === 'string') {
      path = resolve(cwd, layer)
    }
    else if (typeof layer === 'object') {
      path = resolve(layer?.cwd || cwd, layer?.configFileName || configFileName)
    }
    else {
      return empty()
    }

    let filePath = ''
    extensions.some((ext) => {
      if (existsSync(path + ext)) {
        filePath = path + ext
        return true
      }
      return false
    })

    if (!filePath) { return empty() }

    if (filePath) {
      try {
        const _file = jiti(import.meta.url, { interopDefault: true, cache: false, v8cache: false, requireCache: false })(filePath)
        if (_file) { config = _file?.default || file }
      }
      catch (e) {
        return empty()
      }
    }

    return { path: filePath, config }
  }

  const result: LoadConfigResult<U> = {
    config: {} as any,
    sources: [] as string[],
  }

  for (const source of sources) {
    const { path, config } = await resolveConfig(source)

    if (path) {
      result.sources.push(path)
    }

    if (config) {
      result.config = defu(config, result.config)
    }
  }

  return result
}
