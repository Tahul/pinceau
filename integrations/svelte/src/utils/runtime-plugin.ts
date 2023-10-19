import type { PinceauContext } from '@pinceau/core'
import type { PinceauRuntimePluginOptions } from '@pinceau/runtime'

export function createSveltePlugin(ctx: PinceauContext) {
  const runtimeOptions: PinceauRuntimePluginOptions = {
    dev: ctx.options.dev,
    colorSchemeMode: ctx.options?.theme?.colorSchemeMode,
    ...ctx.options.runtime,
  }

  const imports: string[] = []
  if (ctx.options.theme) { imports.push('useThemeSheet') }
  if (ctx.options.runtime) { imports.push('useRuntimeSheet') }

  return `import { ${imports.join(', ')} } from '@pinceau/runtime'

export const PinceauSvelteOptions = ${JSON.stringify(runtimeOptions || {})}

let userOptions

${ctx.options.theme ? 'let themeSheet\nexport const getThemeSheet = () => themeSheet' : ''}

${ctx.options.runtime ? 'let runtimeSheet\nexport const getRuntimeSheet = () => runtimeSheet' : ''}

export const pinceauPlugin = (options) => {
  userOptions = { ...PinceauSvelteOptions, ...options }
  
  ${ctx.options.theme ? 'themeSheet = useThemeSheet(userOptions)' : ''}
  ${ctx.options.runtime ? `runtimeSheet = useRuntimeSheet(${ctx.options.theme ? '{ themeSheet, ...userOptions }' : 'userOptions'})` : ''}
}

${ctx.options.runtime && !!runtimeOptions?.ssr ? 'export const ssr = { toString: () => runtimeSheet.toString() }' : ''}`
}
