import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { PinceauOptions } from '../types'
import { jsFull, tsFull, tsTypesDeclaration } from './formats'

export function prepareOutputDir<UserOptions extends PinceauOptions = PinceauOptions>(
  {
    outputDir = join(process.cwd(), 'node_modules/.vite/pinceau'),
  }: UserOptions,
) {
  if (!existsSync(outputDir))
    mkdirSync(outputDir, { recursive: true })

  stubOutputs(outputDir, true)

  return outputDir
}

export async function stubOutputs(buildPath: string, force = false) {
  const files = {
    'pinceau.css': () => '/* This file is empty because no tokens has been provided. */',
    'pinceau.json': () => '{}',
    'pinceau.js': jsFull,
    'pinceau.ts': tsFull,
    'pinceau.d.ts': tsTypesDeclaration,
  }

  for (const [file, stubbingFunction] of Object.entries(files)) {
    const path = join(buildPath, file)

    if (force && existsSync(path))
      rmSync(path)

    if (!existsSync(path))
      writeFileSync(path, stubbingFunction ? stubbingFunction({ tokens: {}, allTokens: [] } as any, {}) : '')
  }
}
