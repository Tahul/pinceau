import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import type { PinceauOptions } from '@pinceau/core'
import { message, parseAst } from '@pinceau/core/utils'
import createJITI from 'jiti'
import { resolve } from 'pathe'
import type { ConfigFileImport, ConfigLayer, ResolvedConfigLayer } from '../types'
import { getConfigLayer, resolveMediaQueriesKeys } from './config-layers'
import { resolveConfigDefinitions } from './config-definitions'
import { resolveConfigImports } from './config-imports'
import { resolveConfigUtils } from './config-utils'

/**
 * Resolve a config file content for the provided ConfigFileImport.
 */
export async function resolveFileLayer(
  layer: ConfigLayer,
  options: PinceauOptions,
): Promise<ResolvedConfigLayer> {
  // Find full configuration path
  const resolvedConfigPath = resolveConfigPath(layer, options)

  // No configuration found, return empty layer
  if (!resolvedConfigPath) { return getConfigLayer() }

  const { path, ext } = resolvedConfigPath

  // Try to import a configuration file
  let configFile: ConfigFileImport
  try {
    configFile = await importConfigFile(path, ext)
  }
  catch (e) {
    message('CONFIG_RESOLVE_ERROR', [path, e])
    return getConfigLayer(path)
  }
  const { config, content } = configFile

  // Find media queries keys from tokens configuration
  const mqKeys = resolveMediaQueriesKeys(config)

  // Parse configuration AST once
  const configAst = parseAst(content)

  // Try to resolve imports made in configuration file
  let imports: ResolvedConfigLayer['imports'] = []
  if (options.theme.imports) {
    try { imports = resolveConfigImports(configAst) }
    catch (e) { /* Mitigate imports resolving errors */ }
  }

  // Try to resolve tokens definitions
  let definitions: ResolvedConfigLayer['definitions'] = {}
  if (options.theme.definitions) {
    try { definitions = resolveConfigDefinitions(configAst, mqKeys, path) }
    catch (e) { /* Mitigate definitions resolving errors */ }
  }

  // Try to resolved the schema
  let utils: ResolvedConfigLayer['utils'] = {}
  if (config.utils) {
    try { utils = resolveConfigUtils(configAst) }
    catch (e) { /* Mitigate utils resolving errors */ }
    finally {
      // @ts-ignore - Generated type will be read-only
      delete config.utils
    }
  }

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
export async function importConfigFile(path: string, ext: string): Promise<ConfigFileImport> {
  const content = await readFile(path, 'utf-8')

  // Read `.json` configurations
  if (ext === '.json') {
    return {
      path,
      ext,
      content,
      config: JSON.parse(content),
    }
  }

  // Import configuration with JITI
  const config = createJITI(path, {
    interopDefault: true,
    requireCache: false,
    esmResolve: true,
  })(path)

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
    if (existsSync(path + _ext)) {
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
