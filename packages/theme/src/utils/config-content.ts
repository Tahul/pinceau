import type { PinceauOptions } from '@pinceau/core'
import { parseAst } from '../../../core/src/utils'
import type { ResolvedConfigLayer } from '..'
import { resolveConfigImports } from './config-imports'
import { resolveMediaQueriesKeys } from './media-queries'
import { resolveConfigDefinitions } from './config-definitions'
import { resolveConfigUtils } from './config-utils'

export function resolveConfigContent(
  options: PinceauOptions,
  config: any,
  content: string,
  configPath?: string,
) {
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
    try { definitions = resolveConfigDefinitions(configAst, mqKeys, configPath) }
    catch (e) { /* Mitigate definitions resolving errors */ }
  }

  // Try to resolved the schema
  let utils: ResolvedConfigLayer['utils'] = {}
  if (config.utils) {
    try { utils = resolveConfigUtils(configAst, config) }
    catch (e) { /* Mitigate utils resolving errors */ }
    finally {
      delete config.utils
    }
  }

  return {
    imports,
    utils,
    definitions,
    config,
  }
}
