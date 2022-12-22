import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'pathe'
import type { PinceauOptions } from '../types'
import { schemaFull, tsFull, utilsFull } from './formats'

export function prepareOutputDir<UserOptions extends PinceauOptions = PinceauOptions>(
  {
    outputDir = join(process.cwd(), 'node_modules/.vite/pinceau'),
  }: UserOptions,
) {
  if (!existsSync(outputDir)) { mkdirSync(outputDir, { recursive: true }) }

  stubOutputs(outputDir, false)

  return outputDir
}

export async function stubOutputs(buildPath: string, force = false) {
  const files = {
    'index.css': () => '/* This file is empty because no tokens has been provided or your configuration is broken. */',
    'index.ts': tsFull,
    'utils.ts': utilsFull,
    'schema.ts': schemaFull,
  }

  for (const [file, stubbingFunction] of Object.entries(files)) {
    const path = join(buildPath, file)

    if (force && existsSync(path)) { rmSync(path) }

    if (!existsSync(path)) { writeFileSync(path, stubbingFunction ? await stubbingFunction({} as any) : '') }
  }
}
