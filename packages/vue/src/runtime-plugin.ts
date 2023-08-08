import type { PinceauContext } from '@pinceau/core'

export function createVuePlugin(ctx: PinceauContext) {
  const runtimeOptions = { ...ctx.options.runtime, colorSchemeMode: ctx.options.theme?.colorSchemeMode, dev: ctx.options.dev }

  return `import { 
  ${ctx.options.theme ? 'useThemeSheet' : ''},
  ${ctx.options.runtime ? 'useRuntimeSheet' : ''} 
} from '@pinceau/runtime'

export const PinceauVueOptions = ${JSON.stringify(runtimeOptions || {})}

export const PinceauVue = {
  install(app, options = {}) {
    const _options = { ...PinceauVueOptions, ...options }

    ${ctx.options.theme ? 'const themeSheet = useThemeSheet(_options)' : ''}
    ${ctx.options.theme ? 'app.provide(\'pinceauThemeSheet\', themeSheet)' : ''}

    ${ctx.options.runtime ? `const runtimeSheet = useRuntimeSheet(${ctx.options.theme ? '{ themeSheet, ..._options }' : '_options'})` : ''}
    ${ctx.options.runtime ? 'app.provide(\'pinceauRuntimeSheet\', runtimeSheet)' : ''}

    console.log({ themeSheet, runtimeSheet })

    ${ctx.options.runtime && runtimeOptions?.ssr ? 'app.config.globalProperties.$pinceauSsr = { get: () => runtimeSheet.toString() }' : ''}
  }
}`
}
