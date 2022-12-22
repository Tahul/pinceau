import { existsSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'pathe'
import type { PinceauOptions } from '../types'
import { schemaFull, tsFull, utilsFull } from './formats'

export async function prepareOutputDir<UserOptions extends PinceauOptions = PinceauOptions>(
  {
    outputDir = join(process.cwd(), 'node_modules/.vite/pinceau'),
    studio,
  }: UserOptions,
) {
  if (!existsSync(outputDir)) { await mkdir(outputDir, { recursive: true }) }

  await stubOutputs(outputDir, false, studio)

  return outputDir
}

export async function stubOutputs(buildPath: string, force = false, schema = false) {
  const files = {
    'index.css': () => '/* This file is empty because no tokens has been provided or your configuration is broken. */',
    'index.ts': tsFull,
    'utils.ts': utilsFull,
  }

  // Support for configuration schema
  if (schema) { files['schema.ts'] = schemaFull }

  for (const [file, stubbingFunction] of Object.entries(files)) {
    const path = join(buildPath, file)

    if (force && existsSync(path)) { await rm(path) }

    if (!existsSync(path)) { await writeFile(path, stubbingFunction ? await stubbingFunction({} as any) : '') }
  }
}
