import type { ComponentInternalInstance, ComputedRef, VNode } from 'vue'
import { computed } from 'vue'
import { nanoid } from 'nanoid'
import type { PinceauRuntimeIds } from '../types'

export function usePinceauRuntimeIds(
  instance: ComponentInternalInstance,
  classes: any,
  _: boolean,
): ComputedRef<PinceauRuntimeIds> {
  let uid

  const el: VNode['el'] = instance?.vnode?.el

  if (el && el.classList) {
    el.classList.forEach(
      (elClass) => {
        if (uid) { return }
        if (elClass.startsWith('pc-')) {
          uid = elClass.split('pc-')[1]
        }
      },
    )
  }
  else {
    uid = nanoid(6)
  }

  const ids = {
    uid,
    componentId: `[${(instance?.vnode?.type as any)?.__scopeId || undefined}]`,
    uniqueClassName: `pc-${uid}`,
  }

  classes.value.c = ids.uniqueClassName

  return computed(() => ids)
}
