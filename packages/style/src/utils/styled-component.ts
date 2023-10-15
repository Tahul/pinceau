import type { PinceauStyleFunctionContext, RuntimeParts } from '../types'

export function generateStyledComponent(
  styleFn: PinceauStyleFunctionContext,
  runtimeParts: RuntimeParts,
  withPropNames: string | boolean = false,
) {
  return 'usePinceauComponent('
    + `\'${styleFn?.element || 'div'}\', `
    + `${runtimeParts?.staticClass}, `
    + `${runtimeParts?.computedStyles}, `
    + `${runtimeParts?.variants && !styleFn.helpers.includes('withVariants') || 'undefined'}, ${
      (
      `${typeof withPropNames}` === 'string'
    ? withPropNames
    : `${withPropNames && runtimeParts.propNames ? `[${[...runtimeParts.propNames, ...Object.keys(styleFn.variants)].map(propName => `\'${propName}\'`).join(', ')}]` : '[]'}`
      )
     })`
}

export function generatePinceauRuntimeFunction(
  variantsProps?: { [key: string]: any },
  runtimeParts?: RuntimeParts,
  outputVariantsKeys: string | boolean = false,
) {
  return 'usePinceauRuntime('
    + `${runtimeParts?.staticClass}, `
    + `${runtimeParts?.computedStyles}, `
    + `${runtimeParts?.variants}, ${
      (
    typeof outputVariantsKeys === 'string'
    ? outputVariantsKeys
    : `${outputVariantsKeys ? `{ ${Object.keys(variantsProps || {}).join(', ')} }` : 'undefined'}`
      )
}`
    + ')'
}
