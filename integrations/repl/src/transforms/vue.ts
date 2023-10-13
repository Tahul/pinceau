import type {
  BindingMetadata,
  CompilerOptions,
  SFCDescriptor,
} from 'vue/compiler-sfc'
import { toHash } from '@pinceau/core/utils'
import type { File, Store } from '..'
import { transformTS } from './typescript'
import { COMP_IDENTIFIER } from '.'

export async function compileVueFile(
  store: Store,
  { filename, code, compiled }: File,
) {
  const id = toHash(filename)

  const { errors, descriptor } = store.transformer.compiler.parse(code, {
    filename,
    sourceMap: true,
  })

  if (errors.length) { return errors }

  if (
    descriptor.styles.some(s => s.lang)
    || (descriptor.template && descriptor.template.lang)
  ) {
    return ['lang="x" pre-processors for <template> or <style> are currently not supported.']
  }

  const scriptLang = (descriptor.script && descriptor.script.lang) || (descriptor.scriptSetup && descriptor.scriptSetup.lang)

  const isTS = scriptLang === 'ts'
  if (scriptLang && !isTS) { return ['Only lang="ts" is supported for <script> blocks.'] }

  const hasScoped = descriptor.styles.some(s => s.scoped)
  let clientCode = ''
  let ssrCode = ''

  const appendSharedCode = (code: string) => {
    clientCode += code
    ssrCode += code
  }

  let clientScript: string
  let bindings: BindingMetadata | undefined
  try {
    ;[clientScript, bindings] = await doCompileScript(
      store,
      descriptor,
      id,
      false,
      isTS,
    )
  }
  catch (e: any) {
    return [e.stack.split('\n').slice(0, 12).join('\n')]
  }

  clientCode += clientScript

  // script ssr needs to be performed if :
  // 1.using <script setup> where the render fn is inlined.
  // 2.using cssVars, as it do not need to be injected during SSR.
  if (descriptor.scriptSetup || descriptor.cssVars.length > 0) {
    try {
      const ssrScriptResult = await doCompileScript(
        store,
        descriptor,
        id,
        true,
        isTS,
      )
      ssrCode += ssrScriptResult[0]
    }
    catch (e) {
      ssrCode = `/* SSR compile error: ${e} */`
    }
  }
  else {
    // the script result will be identical.
    ssrCode += clientScript
  }

  // Template
  // Only need dedicated compilation if not using <script setup>
  if (
    descriptor.template
    && (!descriptor.scriptSetup || store.transformer.options?.script?.inlineTemplate === false)
  ) {
    const clientTemplateResult = await doCompileTemplate(
      store,
      descriptor,
      id,
      bindings,
      false,
      isTS,
    )
    if (Array.isArray(clientTemplateResult)) { return clientTemplateResult }

    clientCode += `;${clientTemplateResult}`

    const ssrTemplateResult = await doCompileTemplate(
      store,
      descriptor,
      id,
      bindings,
      true,
      isTS,
    )
    if (typeof ssrTemplateResult === 'string') {
      // SSR compile failure is fine
      ssrCode += `;${ssrTemplateResult}`
    }
    else {
      ssrCode = `/* SSR compile error: ${ssrTemplateResult[0]} */`
    }
  }

  if (hasScoped) {
    appendSharedCode(
      `\n${COMP_IDENTIFIER}.__scopeId = ${JSON.stringify(`data-v-${id}`)}`,
    )
  }

  if (clientCode || ssrCode) {
    appendSharedCode(`\n${COMP_IDENTIFIER}.__file = ${JSON.stringify(filename)}` + `\nexport default ${COMP_IDENTIFIER}`)
    compiled.js = clientCode.trimStart()
    compiled.ssr = ssrCode.trimStart()
  }

  // Styles
  let css = ''
  for (const style of descriptor.styles) {
    if (style.module) { return ['<style module> is not supported in the playground.'] }

    const styleResult = await store.transformer.compiler.compileStyleAsync({
      ...store.transformer.options?.style,
      source: style.content,
      filename,
      id,
      scoped: style.scoped,
      modules: !!style.module,
    })

    if (styleResult.errors.length) {
      // postcss uses pathToFileURL which isn't polyfilled in the browser
      // ignore these errors for now
      if (!styleResult.errors[0].message.includes('pathToFileURL')) { store.state.errors = styleResult.errors }

      // proceed even if css compile errors
    }
    else {
      css += `${styleResult.code}\n`
    }
  }
  if (css) { compiled.css = css.trim() }
  else { compiled.css = '/* No <style> tags present */' }

  return []
}

async function doCompileScript(
  store: Store,
  descriptor: SFCDescriptor,
  id: string,
  ssr: boolean,
  isTS: boolean,
): Promise<[code: string, bindings: BindingMetadata | undefined]> {
  if (descriptor.script || descriptor.scriptSetup) {
    const expressionPlugins: CompilerOptions['expressionPlugins'] = isTS ? ['typescript'] : undefined
    const compiledScript = store.transformer.compiler.compileScript(descriptor, {
      inlineTemplate: true,
      ...store.transformer.options?.script,
      id,
      templateOptions: {
        ...store.transformer.options?.template,
        ssr,
        ssrCssVars: descriptor.cssVars,
        compilerOptions: {
          ...store.transformer.options?.template?.compilerOptions,
          expressionPlugins,
        },
      },
    })
    let code = ''
    if (compiledScript.bindings) {
      code += `\n/* Analyzed bindings: ${JSON.stringify(
        compiledScript.bindings,
        null,
        2,
      )} */`
    }
    code
      += `\n${
       store.transformer.compiler.rewriteDefault(
        compiledScript.content,
        COMP_IDENTIFIER,
        expressionPlugins,
      )}`

    if ((descriptor.script || descriptor.scriptSetup)!.lang === 'ts') { code = await transformTS(code) }

    return [code, compiledScript.bindings]
  }
  else {
    return [`\nconst ${COMP_IDENTIFIER} = {}`, undefined]
  }
}

async function doCompileTemplate(
  store: Store,
  descriptor: SFCDescriptor,
  id: string,
  bindingMetadata: BindingMetadata | undefined,
  ssr: boolean,
  isTS: boolean,
) {
  let { code, errors } = store.transformer.compiler.compileTemplate({
    isProd: false,
    ...store.transformer.options?.template,
    source: descriptor.template!.content,
    filename: descriptor.filename,
    id,
    scoped: descriptor.styles.some(s => s.scoped),
    slotted: descriptor.slotted,
    ssr,
    ssrCssVars: descriptor.cssVars,
    compilerOptions: {
      ...store.transformer.options?.template?.compilerOptions,
      bindingMetadata,
      expressionPlugins: isTS ? ['typescript'] : undefined,
    },
  })

  if (errors.length) { return errors }

  const fnName = ssr ? 'ssrRender' : 'render'

  code
    = `\n${code.replace(
      /\nexport (function|const) (render|ssrRender)/,
      `$1 ${fnName}`,
    )}` + `\n${COMP_IDENTIFIER}.${fnName} = ${fnName}`

  if ((descriptor.script || descriptor.scriptSetup)?.lang === 'ts') { code = await transformTS(code) }

  return code
}
