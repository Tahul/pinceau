import { dirname } from 'node:path'
import type { Color, Location } from 'vscode-languageserver/node'
import type { DesignToken } from '@pinceau/theme'
import fastGlob from 'fast-glob'
import createJITI from 'jiti'
import type { PinceauStyleFunctionContext } from '@pinceau/style'
import CacheManager from './cache'
import isColor from './utils/isColor'
import { colorToVSCode } from './utils/convert-color'

export interface PinceauVSCodeSettings {
  buildDirs: string[]
  debug: boolean
  missingTokenHintSeverity: 'warning' | 'error' | 'information' | 'hint'
}

export const defaultSettings: PinceauVSCodeSettings = {
  buildDirs: ['./node_modules/.pinceau'],
  debug: false,
  missingTokenHintSeverity: 'warning',
}

async function globRequire(folderPath: string, globPaths: string[], cb: (filePath: string) => void) {
  const globResult = await fastGlob(
    globPaths,
    {
      cwd: folderPath,
      onlyFiles: true,
      absolute: true,
    },
  )

  return Promise.all(globResult.map(cb))
}

export default class PinceauTokensManager {
  public initialized = false
  public synchronizing: Promise<void> | false = false
  private tokensCache = new CacheManager<DesignToken & { definition: Location, color?: Color }>()
  private transformCache = new CacheManager<{ version: number, styleFns: PinceauStyleFunctionContext[] }>()

  public async syncTokens(folders: string[], settings: Partial<PinceauVSCodeSettings>) {
    this.synchronizing = this.scanFolders(folders, settings)

    await this.synchronizing

    this.synchronizing = false

    if (!this.initialized) { this.initialized = true }

    settings.debug && console.log('✅ Loaded config!')
  }

  public async scanFolders(folders: string[], settings: Partial<PinceauVSCodeSettings>) {
    for (const folderPath of folders) {
      const jiti = createJITI(folderPath, { cache: false, requireCache: false, v8cache: false })

      try {
        await globRequire(
          folderPath,
          (settings?.buildDirs || defaultSettings.buildDirs).map(buildDir => `${buildDir}/*.js`),
          async (filePath) => {
            const themePath = dirname(filePath)

            if (filePath.includes('theme.js')) {
              const file = await jiti(filePath)
              this.updateCacheFromTokensContent({ content: file?.default || file, filePath: themePath })
              settings?.debug && console.log('📥 Loaded theme:', filePath)
            }
            if (filePath.includes('definitions.js')) {
              const file = await jiti(filePath)
              this.pushDefinitions({ content: file?.default || file, filePath: themePath })
              settings?.debug && console.log('📥 Loaded definitions:', filePath)
            }
          },
        )
      }
      catch (e) {
        console.log('❌ Could not load theme file:', folderPath)
      }
    }

    // Clear transform cache
    this.transformCache.clearAllCache()

    if (!this.initialized) { this.initialized = true }
  }

  public pushDefinitions({
    content,
    filePath,
  }: {
    content: any
    filePath: string
  }) {
    Object
      .entries<Location>(content || {})
      .forEach(
        ([key, definition]) => {
          const tokenValue = this.tokensCache.get(key, filePath)

          this.tokensCache.set(
            filePath,
            key,
            {
              ...(tokenValue || {}),
              name: tokenValue?.name || key,
              definition,
            } as any,
          )
        },
      )
  }

  public updateCacheFromTokensContent({
    content,
    filePath,
  }: {
    content: any
    filePath: string
  }) {
    walkTokens(
      content || {},
      (token, _, paths) => {
        const name = paths.join('.')

        const tokenValue = this.tokensCache.get(name, filePath) || {}

        // Handle responsive colors
        if (isColor(token.value?.$initial || token?.value)) {
          if (typeof token.value === 'object') {
            token.color = Object.entries(token.value as { [key: string]: string }).reduce<{ [key: string]: Color }>(
              (acc, [key, value]) => {
                acc[key] = colorToVSCode(value)
                return acc
              },
              {},
            )
          }
          else {
            token.color = colorToVSCode(token.value)
          }
        }

        this.tokensCache.set(filePath, name, { ...tokenValue, ...token, name })
      },
    )
  }

  public getAll() {
    return this.tokensCache.getAll()
  }

  public clearFileCache(filePath: string) {
    this.tokensCache.clearFileCache(filePath)
  }

  public clearAllCache() {
    this.tokensCache.clearAllCache()
  }

  public getTransformCache(): CacheManager<any> {
    return this.transformCache
  }
}

/**
 * Walk through tokens definition an call callback on each design token.
 */
export function walkTokens(
  obj: any,
  cb: (value: any, obj: any, paths: string[]) => any,
  paths: string[] = [],
) {
  let result: Record<string, any> = {}

  if (obj.value) {
    result = cb(obj, result, paths)
  }
  else {
    for (const k in obj) {
      if (obj[k] && typeof obj[k] === 'object') { result[k] = walkTokens(obj[k], cb, [...paths, k]) }
    }
  }

  return result
}
