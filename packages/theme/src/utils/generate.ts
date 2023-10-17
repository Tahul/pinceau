import { join } from 'node:path'
import type { File, Core as Instance, Named, Transform } from 'style-dictionary-esm'
import StyleDictionary from 'style-dictionary-esm'
import { REFERENCES_REGEX, message } from '@pinceau/core/utils'
import type { PinceauContext } from '@pinceau/core'
import type { DesignTokens, PinceauThemeFormat, Theme, ThemeGenerationOutput, ThemeLoadingOutput } from '../types'
import { flattenTokens } from './tokens'
import type { PinceauTheme } from '$pinceau/theme'

export async function generateTheme(
  loadedTheme: ThemeLoadingOutput,
  ctx: PinceauContext,
): Promise<ThemeGenerationOutput> {
  // Create Style Dictionary local instance
  let styleDictionary: Instance = StyleDictionary

  // Get context
  const { theme } = loadedTheme
  const { options } = ctx
  let { buildDir } = options.theme

  // Enforce ending slash for buildDir
  if (buildDir && !buildDir.endsWith('/')) { buildDir += '/' }

  // Enforce buildDir when not set; `false` disables write
  if (buildDir === undefined && ctx.options.cwd) { buildDir = join(ctx.options.cwd, 'node_modules/.pinceau/') }

  // Transforms used
  const usedTransforms = ['size/px', 'color/hex']

  // Files created by Pinceau
  const files: File[] = []

  // Tokens outputs to be pased
  const outputs: ThemeGenerationOutput['outputs'] = {}

  // Generation result for virtual storage
  let result: ThemeGenerationOutput = {
    buildDir,
    theme: {} as Theme<PinceauTheme>,
    outputs: {},
  }

  // Cleanup default fileHeader
  styleDictionary.fileHeader = {}

  // Register all transforms
  const transforms: Named<Transform>[] = ctx.options.theme.tokensTransforms
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
        const result = format.formatter({ ...args, loadedTheme, ctx, instance: styleDictionary })
        outputs[format.importPath] = result
        return result
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

  styleDictionary = styleDictionary.extend({
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
          openingChar: '$',
          closingChar: '\b',
        },
        actions: ['done'],
      },
    },
  })

  // Build theme
  try {
    result = await new Promise<ThemeGenerationOutput>(
      (resolve) => {
        styleDictionary.registerAction({
          name: 'done',
          do: ({ tokens }) => {
            resolve({
              buildDir,
              theme: flattenTokens(tokens) as Theme<PinceauTheme>,
              outputs,
            })
          },
          undo: () => {},
        })
        styleDictionary.buildAllPlatforms()
      },
    )
  }
  catch (e) {
    message('CONFIG_BUILD_ERROR', [e])
  }

  return result
}
