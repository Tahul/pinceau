import type { ComponentInternalInstance, Ref, RendererNode } from 'vue'
import { nanoid } from 'nanoid'
import type { PinceauRuntimeIds } from '../types'

export function usePinceauRuntimeIds(
  instance: ComponentInternalInstance,
  variantsProps: Ref<any>,
  variants: Ref<any>,
  dev: boolean,
): PinceauRuntimeIds {
  let uid = nanoid(6)

  const el: RendererNode = instance?.vnode?.el

  if (el?.getAttribute('p-uid')) {
    const uidAttr = el?.getAttribute('p-uid')
    uid = uidAttr
    el.removeAttribute('p-uid')
  }

  instance.attrs['p-uid'] = uid

  const ids = getIds(
    uid,
    instance,
    variantsProps.value,
    variants?.value || {},
    dev,
  )

  return ids
}

export function getIds(uid: string, instance: ComponentInternalInstance, props: any, variants: any, dev = false): PinceauRuntimeIds {
  const instanceId = (instance?.vnode?.type as any)?.__scopeId || undefined

  const componentId = `[${instanceId}]`

  const devPrefix = `${dev ? `-${(instance?.vnode?.type as any)?.__name}-` : '-'}`

  const variantsClassName = `p${devPrefix}v${dev ? 'ariants' : ''}-${uid}`

  const uniqueClassName = uid ? `p${devPrefix}${uid}` : undefined

  return { uid, componentId, variantsClassName, uniqueClassName }
}
