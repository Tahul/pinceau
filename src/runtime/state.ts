import { reactive } from 'vue'
import type { PinceauRuntimeIds } from '../types/runtime'

export function usePinceauRuntimeState() {
  const variants = reactive({})

  const props = reactive({})

  const computedStyles = reactive({})

  const push = (
    ids: PinceauRuntimeIds,
    componentVariants: any,
    componentProps: any,
    componentCssProp: any,
    componentComputedStyles: any,
  ) => {
    if (!ids.componentId) { return }

    // Push variants and variant classes
    variants[ids.componentId] = componentVariants

    // Push props
    if (!props[ids.componentId]) { props[ids.componentId] = {} }
    props[ids.componentId][ids.variantsClassName] = componentProps

    if (ids.uniqueClassName) {
      if (!computedStyles[ids.componentId]) { computedStyles[ids.componentId] = {} }
      if (!computedStyles[ids.componentId][ids.uniqueClassName]) { computedStyles[ids.componentId][ids.uniqueClassName] = {} }

      // () => computedStyles
      if (componentComputedStyles) { computedStyles[ids.componentId][ids.uniqueClassName] = componentComputedStyles }

      // :css prop
      if (componentCssProp) { computedStyles[ids.componentId][ids.uniqueClassName].css = componentCssProp }
    }
  }

  const drop = (ids: PinceauRuntimeIds) => {
    // Delete component variants
    if (props?.[ids.componentId]?.[ids.variantsClassName]) { delete props[ids.componentId][ids.variantsClassName] }

    // Delete component computed styles
    if (computedStyles?.[ids.componentId]?.[ids.uniqueClassName]) { delete computedStyles[ids.componentId][ids.uniqueClassName] }

    // Delete full styles if no more component with that id mounted
    if (props?.[ids.componentId] && Object.keys(props[ids.componentId]).length === 0) {
      delete props[ids.componentId]
      delete computedStyles[ids.componentId]
      delete variants[ids.variantsClassName]
    }
  }

  return {
    variants,
    computedStyles,
    props,
    push,
    drop,
  }
}
