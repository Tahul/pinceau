import type { PinceauContext } from '@pinceau/core'
import type { PinceauRuntimePluginOptions } from '@pinceau/runtime'

export function createVuePlugin(ctx: PinceauContext) {
  const runtimeOptions: PinceauRuntimePluginOptions = {
    dev: ctx.options.dev,
    colorSchemeMode: ctx.options?.theme?.colorSchemeMode,
    ...ctx.options.runtime,
  }

  const imports: string[] = []
  if (ctx.options.theme) { imports.push('useThemeSheet') }
  if (ctx.options.runtime) { imports.push('useRuntimeSheet') }

  return `import { ${imports.join(', ')} } from '@pinceau/runtime'

export const PinceauVueOptions = ${JSON.stringify(runtimeOptions || {})}

export const PinceauVue = {
  install(app, options = {}) {
    const _options = { ...PinceauVueOptions, ...options }

    ${ctx.options.theme ? 'const themeSheet = useThemeSheet(_options)' : ''}
    ${ctx.options.theme ? 'app.provide(\'pinceauThemeSheet\', themeSheet)' : ''}

    ${ctx.options.runtime ? `const runtimeSheet = useRuntimeSheet(${ctx.options.theme ? '{ themeSheet, ..._options }' : '_options'})` : ''}
    ${ctx.options.runtime ? 'app.provide(\'pinceauRuntimeSheet\', runtimeSheet)' : ''}

    ${ctx.options.runtime && !!runtimeOptions?.ssr ? 'app.config.globalProperties.$pinceauSSR = { toString: () => runtimeSheet.toString() }' : ''}
  }
}`
}
