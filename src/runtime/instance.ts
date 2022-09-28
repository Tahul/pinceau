import { hash } from 'ohash'
import type { ComponentInternalInstance } from 'vue'
import type { PinceauRuntimeIds } from '../types'

export const getIds = (instance: ComponentInternalInstance, props: any, variants: any): PinceauRuntimeIds => {
  const componentId = `[${(instance.vnode.type as any).__scopeId}]`

  const uid = instance.uid.toString()

  const hashed = hash({
    componentId,
    props: JSON.stringify(props),
    variants: JSON.stringify(variants),
  })

  return { uid, componentId, class: `p-${hashed}` }
}

export const bindClass = (instance: ComponentInternalInstance, ids: PinceauRuntimeIds, previousIds: PinceauRuntimeIds) => {
  if (!instance.attrs) { instance.attrs = {} }
  if (!instance.attrs.class) { instance.attrs.class = [] }

  const classes: string[] = instance.attrs.class as string[]

  if (previousIds && (instance.attrs.class as any).includes(previousIds.class)) {
    classes.splice(classes.indexOf(previousIds.class), 1)
  }

  instance.attrs.class = [...classes, ids.class]
}
