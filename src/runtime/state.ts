import { reactive } from 'vue'
import type { PinceauRuntimeIds } from '../types/runtime'

export function usePinceauRuntimeState() {
  const variantsState = reactive({})

  const propsState = reactive({})

  const push = (
    ids: PinceauRuntimeIds,
    componentVariants: any,
    componentProps: any,
  ) => {
    // Push variants and variant classes
    variantsState[ids.componentId] = componentVariants

    // Push props
    if (!propsState[ids.componentId]) { propsState[ids.componentId] = {} }
    propsState[ids.componentId][ids.class] = componentProps
  }

  const drop = (ids: PinceauRuntimeIds) => {
    // Delete component variants
    if (propsState?.[ids.componentId]?.[ids.class]) { delete propsState[ids.componentId][ids.class] }

    // Delete full variants if no more component with that id mounted
    if (propsState?.[ids.componentId] && Object.keys(propsState[ids.componentId]).length === 0) {
      delete propsState[ids.componentId]
      delete variantsState[ids.class]
    }
  }

  return {
    variantsState,
    propsState,
    push,
    drop,
  }
}
