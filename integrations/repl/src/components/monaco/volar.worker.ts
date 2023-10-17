import * as worker from 'monaco-editor-core/esm/vs/editor/editor.worker'
import * as typescriptService from 'volar-service-typescript'
import type * as monaco from 'monaco-editor-core'
import { decorateServiceEnvironment } from '@volar/cdn'
import type { VueCompilerOptions } from '@vue/language-service'
import { resolveConfig } from '@vue/language-service'
import {
  createLanguageHost,
  createLanguageService,
  createServiceEnvironment,
} from '@volar/monaco/worker'
import {
  createJsDelivrFs,
  createJsDelivrUriResolver,
} from './cdn'
import type { WorkerHost, WorkerMessage } from './env'
import { svelteLanguage } from './languages/svelte'
import { typescriptLanguage } from './languages/typescript'

export interface CreateData {
  language?: 'vue' | 'svelte' | 'react' | 'typescript'
  tsconfig: {
    compilerOptions?: import('typescript').CompilerOptions
    vueCompilerOptions?: Partial<VueCompilerOptions>
  }
  dependencies: Record<string, string>
}

let ts: typeof import('typescript')

// eslint-disable-next-line no-restricted-globals
self.onmessage = async (msg: MessageEvent<WorkerMessage>) => {
  if (msg.data?.event === 'init') {
    ts = await importTsFromCdn(msg.data.tsVersion)

    // eslint-disable-next-line no-restricted-globals
    self.postMessage('inited')

    return
  }

  worker.initialize(
    (
      ctx: monaco.worker.IWorkerContext<WorkerHost>,
      { tsconfig, dependencies, language }: CreateData,
    ) => {
      const { options: compilerOptions } = ts.convertCompilerOptionsFromJson(
        tsconfig?.compilerOptions || {},
        '',
      )

      const env = createServiceEnvironment()

      const host = createLanguageHost(
        ctx.getMirrorModels,
        env,
        '/src',
        compilerOptions,
      )

      const jsDelivrFs = createJsDelivrFs(ctx.host.onFetchCdnFile)

      const jsDelivrUriResolver = createJsDelivrUriResolver(
        '/node_modules',
        dependencies,
      )

      decorateServiceEnvironment(env, jsDelivrUriResolver, jsDelivrFs)

      const noopVue = {
        'vue': () => ({}),
        'vue/autoInsertDotValue': () => ({}),
        'vue/autoInsertSpaces': () => ({}),
        'vue/autoInsertParentheses': () => ({}),
        'vue/directiveComments': () => ({}),
        'vue/extractComponent': () => ({}),
        'vue/referencesCodeLens': () => ({}),
        'vue/toggleVBind': () => ({}),
        'vue/visualizeHiddenCallbackParam': () => ({}),
        'vue/twoslash-queries': () => ({}),
        'typescript': typescriptService.default(),
      }

      const serviceConfig = resolveConfig(
        {
          services: {
            'pug': () => ({}),
            'emmet': () => ({}),
            'pug-beautify': () => ({}),
            ...(language !== 'vue' ? noopVue : {})
          },
        },
        compilerOptions,
        tsconfig.vueCompilerOptions || {},
        ts as any,
      )

      if (language === 'svelte') {
        // @ts-ignore
        serviceConfig.languages[0] = svelteLanguage
      } else if (language !== 'vue') {
        // @ts-ignore
        serviceConfig.languages[0] = typescriptLanguage
      }

      return createLanguageService(
        {
          typescript: ts as any,
        },
        env,
        serviceConfig as any,
        host,
      )
    },
  )
}

async function importTsFromCdn(tsVersion: string) {
  const _module = globalThis.module
  ;(globalThis as any).module = { exports: {} }
  const tsUrl = `https://cdn.jsdelivr.net/npm/typescript@${tsVersion}/lib/typescript.js`
  await import(/* @vite-ignore */ tsUrl)
  const ts = globalThis.module.exports
  globalThis.module = _module
  return ts as typeof import('typescript')
}
