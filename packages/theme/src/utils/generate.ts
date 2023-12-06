import fs from 'node:fs'
import { REFERENCES_REGEX, message } from '@pinceau/core/utils'
import type { PinceauContext } from '@pinceau/core'
import type { PinceauTheme } from '@pinceau/outputs'
import { setFs } from 'style-dictionary/fs'
import SD from 'style-dictionary'
import type { DesignTokens, PinceauThemeFormat, Theme, ThemeGenerationOutput, ThemeLoadingOutput } from '../types'
import { flattenTokens } from './tokens'
import { resolveBuildDir } from './build-dir'

setFs(fs)

export async function generateTheme(
  loadedTheme: ThemeLoadingOutput,
  ctx: PinceauContext,
): Promise<ThemeGenerationOutput> {
  // Create Style Dictionary local instance
  let styleDictionary: SD.Core = SD as SD.Core

  // Get context
  const { theme } = loadedTheme

  // Resolve build dir path
  const buildDir = resolveBuildDir(ctx)

  // Transforms used
  const usedTransforms = ['size/px', 'color/hex']

  // Files created by Pinceau
  const files: SD.File[] = []

  // Generation result for virtual storage
  const result: ThemeGenerationOutput = {
    buildDir,
    theme: {} as PinceauTheme,
    outputs: {},
  }

  // Register all transforms
  const transforms: SD.Named<SD.Transform>[] = ctx.options.theme.tokensTransforms
  for (const transform of transforms) {
    styleDictionary.registerTransform(transform)
    usedTransforms.push(transform.name)
  }

  // Registers PinceauThemeFormats
  const formats: PinceauThemeFormat[] = ctx.options.theme.outputFormats
  for (const format of formats) {
    // Register format in Style Dictionary
    styleDictionary.registerFormat({
      name: format.importPath,
      formatter(args) {
        const outputResult = format.formatter({ ...args, loadedTheme, ctx, instance: styleDictionary })
        result.outputs[format.importPath] = outputResult
        return outputResult
      },
    })

    // Register formats in file targets
    files.push({
      format: format.importPath,
      destination: format.destination,
    })

    // Register new output in PinceauContext if not already present
    if (!ctx.getOutputId(format.virtualPath)) { ctx.registerOutput(format.importPath, format.virtualPath) }
  }

  // Transform group used accross all tokens formats
  styleDictionary.registerTransformGroup({
    name: 'pinceau',
    transforms: usedTransforms,
  })

  // Grab final tokens payload from an action
  styleDictionary.registerAction({
    name: 'done',
    do: ({ tokens }) => {
      result.theme = flattenTokens(tokens)
    },
    undo: () => {},
  })

  styleDictionary = new (styleDictionary as any)({
    tokens: theme as DesignTokens,
    platforms: {
      base: {
        silent: true,
        transformGroup: 'pinceau',
        buildPath: buildDir || undefined,
        files,
        write: !!buildDir,
        options: {
          outputReferences: true,
        },
        referencesOptions: {
          regex: REFERENCES_REGEX,
          opening_character: '$',
          closing_character: '\b',
        },
        actions: ['done'],
      },
    },
  }) as SD.Core
  await (styleDictionary as any).hasInitialized

  // Build theme
  try {
    await (styleDictionary as any).buildAllPlatforms()
  }
  catch (e) {
    message('CONFIG_BUILD_ERROR', [e])
  }

  return result
}
