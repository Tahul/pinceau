import fs from 'node:fs'
import type { PinceauContext, PinceauOptions } from '@pinceau/core'
import { message } from '@pinceau/core/utils'
import { resolve } from 'pathe'
import type { ConfigFileImport, ConfigLayer, ResolvedConfigLayer } from '../types'
import { getConfigLayer } from './config-layers'
import { resolveConfigContent } from './config-content'

/**
 * Resolve a config file content for the provided ConfigFileImport.
 */
export async function resolveFileLayer(
  layer: ConfigLayer,
  options: PinceauOptions,
  ctx?: PinceauContext,
): Promise<ResolvedConfigLayer> {
  // Find full configuration path
  const resolvedConfigPath = resolveConfigPath(layer, options)

  // No configuration found, return empty layer
  if (!resolvedConfigPath) { return getConfigLayer() }

  const { path, ext } = resolvedConfigPath

  // Try to import a configuration file
  let configFile: ConfigFileImport
  try {
    configFile = await importConfigFile(path, ext, ctx)
  }
  catch (e) {
    message('CONFIG_RESOLVE_ERROR', [path, e])
    return getConfigLayer(path)
  }
  const { config, content } = configFile

  const { utils, imports, definitions } = resolveConfigContent(options, config, content, path)

  return {
    path,
    ext,
    content,
    theme: config,
    definitions,
    utils,
    imports,
  }
}

/**
 * Makes an import of a configuration file.
 */
export async function importConfigFile(
  path: string,
  ext: string,
  ctx?: PinceauContext,
): Promise<ConfigFileImport> {
  const content = fs.readFileSync(path, 'utf-8')

  // Read `.json` configurations
  if (ext === '.json') {
    return {
      path,
      ext,
      content,
      config: JSON.parse(content),
    }
  }

  // Try importing the configuration with a dynamic import
  let config
  try {
    // First try to use a dynamic import for this file.
    config = await import(`${path}?${Date.now()}`).then(d => d?.default || d)
  }
  catch (e) {
    //
  }

  // Fallback on jiti if it is present
  if (!config && ctx?.jiti) {
    const jitiImport = ctx.jiti(path)
    config = jitiImport?.default || jitiImport
  }

  return {
    path,
    ext,
    content,
    config,
  }
}

/**
 * Resolves a configuration path.
 */
export function resolveConfigPath(layer: ConfigLayer, options: PinceauOptions) {
  // Resolve layer path config path (without ext)
  let path = ''
  if (typeof layer === 'string') { path = resolve(layer) }
  else if (typeof layer === 'object' && layer?.path) { path = resolve(layer?.path, layer?.configFileName || options.theme.configFileName || '') }
  else { return }

  // Find extension
  let ext: string | undefined
  for (const _ext of options.theme.configExtensions) {
    if (fs.existsSync(path + _ext)) {
      path = path + _ext
      ext = _ext
      break
    }
  }

  if (!ext) { return }

  return {
    path,
    ext,
  }
}
