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
  typescriptFormat,
  utilsFormat,
  utilsTypesFormat,
} from '@pinceau/theme/utils'
import {
  normalizeTokens,
} from '@pinceau/theme/runtime'
import { transformAddPinceauClass, transformAddRuntimeScriptTag, transformWriteScriptFeatures } from '@pinceau/vue/transforms'
import { PinceauVueTransformer } from '@pinceau/vue/utils'
import { PinceauSvelteTransformer } from '@pinceau/svelte/utils'
import { findDefaultExport, parseAst, parsePinceauQuery, printAst, usePinceauContext, usePinceauTransformContext, visitAst } from '@pinceau/core/utils'
import { suite as styleSuite } from '@pinceau/style/transforms'
import { suite as themeSuite } from '@pinceau/theme/transforms'
import type { PinceauContext } from '@pinceau/core'
import { File } from '..'
import type { ReplStore } from '..'
import { themeFile } from '.'

export class PinceauProvider {
  store: ReplStore
  defaultVersion: string = 'latest'
  targetVersion: string | undefined
  themeUtils: typeof import('@pinceau/theme/utils') | null = null
  pendingImport: Promise<any> | undefined
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
  }

  init() {
    watch(
      () => this.store.state.files[`src/${themeFile}`],
      async (newFile) => {
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

        const builtTheme = await generateTheme(
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

        for (const [key, output] of Object.entries(builtTheme.outputs)) {
          builtFiles[key] = new File(key, output, true)
        }

        this.store.state.builtFiles = builtFiles
      },
      {
        immediate: true,
      },
    )
  }

  transformReact(file: File) {
    // console.log({ file })
    return file
  }

  transformSvelte(file: File) {
    // console.log({ file })
    return file
  }

  async transformVue(file: File) {
    if (!file.filename.endsWith('.vue')) { return }

    const query = parsePinceauQuery(file.filename)

    this.pinceauContext.addTransformed(file.filename, query)

    const transformContext = usePinceauTransformContext(
      file.code,
      query,
      this.pinceauContext,
    )

    transformContext.registerTransforms(styleSuite)
    transformContext.registerTransforms(themeSuite)
    transformContext.registerTransforms({
      globals: [
        transformAddRuntimeScriptTag,
      ],
      templates: [
        transformAddPinceauClass,
      ],
      scripts: [
        transformWriteScriptFeatures,
      ],
    })

    await transformContext.transform()

    return transformContext
  }
}
