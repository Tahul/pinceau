import { existsSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'pathe'
import type { PinceauOptions } from '@pinceau/core'
import { schemaFull, tsFull, utilsFull } from './outputs'

/**
 * Prepares build outputs directory.
 */
export async function prepareBuildDir(
  options: PinceauOptions,
) {
  const themeDir = join(options.theme.buildDir || '', 'theme')

  if (!existsSync(themeDir)) { await mkdir(themeDir, { recursive: true }) }

  await stubOutputs(options, false)
}

/**
 * Stub the outputs in in case they are not yet built.
 */
export async function stubOutputs(
  options: PinceauOptions,
  force = false,
) {
  const files = {
    'theme/index.css': () => '/* This file is empty because no tokens has been provided or your configuration is broken. */',
    'definitions.ts': () => 'export const definitions = {} as const',
    'index.ts': tsFull,
    'utils.ts': utilsFull,
  }

  // Support for configuration schema
  if (options.theme.studio) { files['schema.ts'] = schemaFull }

  for (const [file, stubbingFunction] of Object.entries(files)) {
    const path = join(options.theme.buildDir, file)

    if (force && existsSync(path)) { await rm(path) }

    if (!existsSync(path)) { await writeFile(path, stubbingFunction ? await stubbingFunction({} as any) : '') }
  }
}
