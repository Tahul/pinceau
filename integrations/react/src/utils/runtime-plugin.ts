import type { PinceauContext } from '@pinceau/core'
import type { PinceauRuntimePluginOptions } from '@pinceau/runtime'

export function createReactPlugin(ctx: PinceauContext) {
  const runtimeOptions: PinceauRuntimePluginOptions = {
    dev: ctx.options.dev,
    colorSchemeMode: ctx.options?.theme?.colorSchemeMode,
    ...ctx.options.runtime,
  }

  const imports: string[] = []
  if (ctx.options.theme) { imports.push('useThemeSheet') }
  if (ctx.options.runtime) { imports.push('useRuntimeSheet') }

  return `import React, { createContext, useContext } from 'react'
import { ${imports.join(', ')} } from '@pinceau/runtime'

export const PinceauReactOptions = ${JSON.stringify(runtimeOptions || {})}

const PinceauContext = createContext()

export const usePinceauContext = () => useContext(PinceauContext)

export const PinceauProvider = ({ options, children }) => {
  const userOptions = { ...PinceauReactOptions, ...options }

  ${ctx.options.theme ? 'const themeSheet = useThemeSheet(userOptions)' : ''}
  ${ctx.options.runtime ? `const runtimeSheet = useRuntimeSheet(${ctx.options.theme ? '{ themeSheet, ...userOptions }' : 'userOptions'})` : ''}
  ${ctx.options.runtime && !!runtimeOptions?.ssr ? 'const ssr = { toString: () => runtimeSheet.toString() }' : ''}

  return React.createElement(PinceauContext.Provider, {  value: { themeSheet, runtimeSheet, ssr }, children })
}`
}
