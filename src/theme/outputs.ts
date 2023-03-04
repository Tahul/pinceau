import { existsSync } from 'fs'
import { mkdir, rm, writeFile } from 'fs/promises'
import { join } from 'pathe'
import type { PinceauOptions } from '../types'
import { schemaFull, tsFull, utilsFull } from './formats'

export async function prepareBuildDir(
  {
    buildDir = join(process.cwd(), 'node_modules/.vite/pinceau'),
    studio = false,
  }: PinceauOptions,
) {
  const themeDir = join(buildDir, 'theme')
  if (!existsSync(themeDir)) { await mkdir(themeDir, { recursive: true }) }

  await stubOutputs({ buildDir, studio }, false)

  return buildDir
}

export async function stubOutputs(
  {
    buildDir,
    studio,
  }: PinceauOptions,
  force = false,
) {
  const files = {
    'theme/index.css': () => '/* This file is empty because no tokens has been provided or your configuration is broken. */',
    'definitions.ts': () => 'export const definitions = {} as const',
    'index.ts': tsFull,
    'utils.ts': utilsFull,
  }

  // Support for configuration schema
  if (studio) { files['schema.ts'] = schemaFull }

  for (const [file, stubbingFunction] of Object.entries(files)) {
    const path = join(buildDir, file)

    if (force && existsSync(path)) { await rm(path) }

    if (!existsSync(path)) { await writeFile(path, stubbingFunction ? await stubbingFunction({} as any) : '') }
  }
}
