import { join, resolve } from 'path'
import type { LoadConfigResult, LoadConfigSource } from 'unconfig'
import { createConfigLoader as createLoader } from 'unconfig'
import type { PinceauConfig, PinceauOptions } from '../types'
export type { LoadConfigResult, LoadConfigSource }

export async function loadConfig<U extends PinceauConfig>(
  {
    cwd = process.cwd(),
    configOrPaths = [cwd],
    configFileName = 'pinceau.config',
  }: PinceauOptions,
): Promise<LoadConfigResult<U>> {
  let _sources: string[] = []
  let inlineConfig = {} as U

  if (Array.isArray(configOrPaths))
    _sources = configOrPaths

  if (typeof configOrPaths === 'string')
    _sources = [configOrPaths]

  if (Object.prototype.toString.call(configOrPaths) === '[object Object]') {
    inlineConfig = configOrPaths as U
    if (inlineConfig?.configFile)
      _sources = [inlineConfig.configFile]
  }

  const sources: LoadConfigSource[] = [
    {
      files: configFileName,
    },
    ..._sources.reduce(
      (acc: LoadConfigSource[], path: string) => {
        // process.cwd() already gets scanned by default
        if (resolve(cwd, path) === resolve(cwd))
          return acc

        acc.push({
          files: join(path, configFileName),
        })

        return acc
      },
      [],
    ),
  ]

  const loader = createLoader<U>({
    sources,
    cwd,
    defaults: inlineConfig,
    merge: true,
  })

  const result = await loader.load()

  result.config = result.config || inlineConfig

  return result
}
