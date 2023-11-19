import { watch } from 'vue'
import {
  cssFormat,
  declarationFormat,
  generateTheme,
  javascriptFormat,
  pinceauNameTransformer,
  pinceauVariableTransformer,
  resolveConfigContent,
  resolveMediaQueriesKeys,
  pluginTypes as themePluginTypes,
  typescriptFormat,
  utilsFormat,
  utilsTypesFormat,
} from '@pinceau/theme/utils'
import MagicString from 'magic-string'
import {
  normalizeTokens,
} from '@pinceau/theme/runtime'
import {
  transformAddPinceauClass as vueTransformAddPinceauClass,
  transformAddRuntimeScriptTag as vueTransformAddRuntimeScriptTag,
  transformStyleTs as vueTransformStyleTs,
  transformWriteScriptFeatures as vueTransformWriteScriptFeatures,
  transformWriteStyleFeatures as vueTransformWriteStyleFeatures,
} from '@pinceau/vue/transforms'
import { PinceauVueTransformer } from '@pinceau/vue/utils'
import { PinceauSvelteTransformer } from '@pinceau/svelte/utils'
import {
  transformAddRuntimeScriptTag as svelteTransformAddRuntimeScriptTag,
  transformWriteScriptFeatures as svelteTransformWriteScriptFeatures,
} from '@pinceau/svelte/transforms'
import { transformWriteScriptFeatures as reactTransformWriteScriptFeatures } from '@pinceau/react/transforms'
import { findDefaultExport, parseAst, parsePinceauQuery, printAst, usePinceauContext, usePinceauTransformContext, visitAst } from '@pinceau/core/utils'
import { suite as styleSuite } from '@pinceau/style/transforms'
import { suite as themeSuite } from '@pinceau/theme/transforms'
import { pluginTypes as stylePluginTypes } from '@pinceau/style/utils'
import type { PinceauContext } from '@pinceau/core'
import { File } from '..'
import type { ReplStore } from '..'
import { processModule } from '../compiler'
import { transformTS } from '../transforms/typescript'
import { debounce } from '../utils'
import { themeFile } from '.'

export class PinceauProvider {
  store: ReplStore
  defaultVersion: string = 'latest'
  targetVersion: string | undefined
  themeUtils: typeof import('@pinceau/theme/utils') | null = null
  pendingImport: Promise<any> | undefined
  pendingBuild: Promise<any> | undefined
  pinceauContext: PinceauContext

  constructor(store: ReplStore) {
    this.store = store

    this.pinceauContext = usePinceauContext({
      theme: {
        buildDir: false,
        outputFormats: [
          cssFormat,
          declarationFormat,
          javascriptFormat,
          utilsFormat,
          utilsTypesFormat,
          typescriptFormat,
        ],
        tokensTransforms: [
          pinceauNameTransformer,
          pinceauVariableTransformer,
        ],
      },
    })

    this.pinceauContext.registerTransformer(
      'vue',
      PinceauVueTransformer,
    )

    this.pinceauContext.registerTransformer(
      'svelte',
      PinceauSvelteTransformer,
    )

    this.pinceauContext.addTypes(themePluginTypes)
    this.pinceauContext.addTypes(stylePluginTypes)
  }

  async init() {
    const _init = async (newFile = this.store.state.files[themeFile]) => {
      if (!newFile) { return }

      const builtFiles = {}

      const defineThemeNode = findDefaultExport(parseAst(newFile.code, { sourceType: 'module' })) as any

      const themeExpression = defineThemeNode.arguments[0]

      let code = newFile.code

      // Eval utils to runtime from AST
      let utilsCode
      visitAst(
        themeExpression,
        {
          visitObjectProperty(node) {
            if (node?.parentPath?.parentPath?.name === 'root' && node.value.key.name === 'utils') {
              utilsCode = node.value.value
              node.prune()
              return false
            }
            return this.traverse(node)
          },
        },
      )
      if (utilsCode) { utilsCode = printAst(utilsCode).code }
      code = printAst(themeExpression).code

      // eslint-disable-next-line no-eval
      const _eval = eval
      _eval(`var _theme = ${code}`)
      // @ts-ignore
      let theme = _theme

      const { utils, definitions, imports } = resolveConfigContent(this.pinceauContext.options, theme, newFile.code)

      const mqKeys = resolveMediaQueriesKeys(theme)

      theme = normalizeTokens(theme, mqKeys, true)

      this.pendingBuild = generateTheme(
        {
          definitions,
          imports,
          schema: {},
          sources: ['/'],
          theme,
          utils,
        },
        this.pinceauContext,
      )

      const builtTheme = await this.pendingBuild

      for (const [key, output] of Object.entries(builtTheme.outputs as { [key: string]: string })) {
        if (key === '@pinceau/outputs' || key.includes('.css')) {
          builtFiles[key] = new File(
            key,
            output,
            true,
          )
          continue
        }

        let built: string = output
        if (key.includes('-ts')) {
          built = await transformTS(built)
        }

        const newFile = builtFiles[key] = new File(
          key,
          output,
          true,
        )

        newFile.compiled.js = newFile.compiled.ssr = processModule(
          this.store,
          built,
          key,
        ).code
      }

      this.store.state.builtFiles = builtFiles
    }

    const debouncedBuild = debounce(_init, 250)

    watch(
      () => this.store.state.files[themeFile],
      () => debouncedBuild(),
      {
        deep: true,
      },
    )

    await _init()
  }

  async transformReact(filename: string, code: string) {
    const query = parsePinceauQuery(filename)

    if (!this.pinceauContext.transformed[filename]) {
      this.pinceauContext.addTransformed(filename, query)
    }

    const transformContext = usePinceauTransformContext(
      new MagicString(code),
      query,
      this.pinceauContext,
    )

    transformContext.registerTransforms(styleSuite)
    transformContext.registerTransforms(themeSuite)
    transformContext.registerTransforms({
      scripts: [
        reactTransformWriteScriptFeatures,
      ],
    })

    await transformContext.transform()

    return transformContext
  }

  async transformSvelte(filename: string, code: string) {
    const query = parsePinceauQuery(filename)

    if (!this.pinceauContext.transformed[filename]) {
      this.pinceauContext.addTransformed(filename, query)
    }

    const transformContext = usePinceauTransformContext(
      new MagicString(code),
      query,
      this.pinceauContext,
    )

    transformContext.registerTransforms(styleSuite)
    transformContext.registerTransforms(themeSuite)
    transformContext.registerTransforms({
      globals: [
        svelteTransformAddRuntimeScriptTag,
      ],
      scripts: [
        svelteTransformWriteScriptFeatures,
      ],
    })

    await transformContext.transform()

    return transformContext
  }

  async transformVue(filename: string, code: string) {
    if (!filename.endsWith('.vue')) { return }

    this.pinceauContext.transformed = {}

    const query = parsePinceauQuery(filename)

    this.pinceauContext.addTransformed(filename, query)

    const transformContext = usePinceauTransformContext(
      new MagicString(vueTransformStyleTs(code)),
      query,
      this.pinceauContext,
    )

    transformContext.registerTransforms(styleSuite)
    transformContext.registerTransforms(themeSuite)
    transformContext.registerTransforms({
      globals: [
        vueTransformAddRuntimeScriptTag,
      ],
      templates: [
        vueTransformAddPinceauClass,
      ],
      scripts: [
        vueTransformWriteScriptFeatures,
      ],
      styles: [
        async (transformContext, pinceauContext) => {
          // Skip `pc-fn` tags since those are already handled in earlier transformation
          if (transformContext.query.styleFunction) { return }

          await vueTransformWriteStyleFeatures(transformContext, pinceauContext)
        },
      ],
    })

    await transformContext.transform()

    return transformContext
  }
}
