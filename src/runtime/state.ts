import { reactive } from 'vue'
import type { PinceauRuntimeIds } from '../types/runtime'

export function usePinceauRuntimeState() {
  const variantsState = reactive({})

  const propsState = reactive({})

  const computedStylesState = reactive({})

  const push = (
    ids: PinceauRuntimeIds,
    componentVariants: any,
    componentProps: any,
    componentCssProp: any,
    componentComputedStyles: any,
  ) => {
    if (!ids.componentId) { return }

    // Push variants and variant classes
    variantsState[ids.componentId] = componentVariants

    // Push props
    if (!propsState[ids.componentId]) { propsState[ids.componentId] = {} }
    propsState[ids.componentId][ids.className] = componentProps

    if (ids.computedClassName) {
      if (!computedStylesState[ids.componentId]) { computedStylesState[ids.componentId] = {} }
      if (!computedStylesState[ids.componentId][ids.computedClassName]) { computedStylesState[ids.componentId][ids.computedClassName] = {} }

      if (componentComputedStyles) { computedStylesState[ids.componentId][ids.computedClassName] = componentComputedStyles }

      if (componentCssProp) { computedStylesState[ids.componentId][ids.computedClassName].css = componentCssProp }
    }
  }

  const drop = (ids: PinceauRuntimeIds) => {
    // Delete component variants
    if (propsState?.[ids.componentId]?.[ids.className]) { delete propsState[ids.componentId][ids.className] }

    // Delete component computed styles
    if (computedStylesState?.[ids.componentId]?.[ids.computedClassName]) { delete computedStylesState[ids.componentId][ids.computedClassName] }

    // Delete full styles if no more component with that id mounted
    if (propsState?.[ids.componentId] && Object.keys(propsState[ids.componentId]).length === 0) {
      delete propsState[ids.componentId]
      delete computedStylesState[ids.componentId]
      delete variantsState[ids.className]
    }
  }

  return {
    variantsState,
    computedStylesState,
    propsState,
    push,
    drop,
  }
}
