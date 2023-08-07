import type { PinceauContext } from '@pinceau/core'

export function createVuePlugin(ctx: PinceauContext) {
  const runtimeOptions = { ...ctx.options.runtime, colorSchemeMode: ctx.options.theme?.colorSchemeMode, dev: ctx.options.dev }

  return `import { useStylesheet } from '$pinceau/runtime'

export const PinceauVueOptions = ${JSON.stringify(runtimeOptions || {})}

export const PinceauVue = {
  install(app) {
    const themeSheet = useStylesheet('#pinceau-theme')
    const runtimeSheet = useStylesheet('#pinceau-runtime')

    // Inject/provide for composables access
    ${ctx.options.theme ? 'app.provide(\'pinceauThemeSheet\', themeSheet)' : ''}
    ${ctx.options.runtime ? 'app.provide(\'pinceauRuntimeSheet\', runtimeSheet)' : ''}
    ${runtimeOptions?.ssr ? 'app.config.globalProperties.$pinceauSsr = { get: () => runtimeSheet.toString() }' : ''}
  }
}`
}
