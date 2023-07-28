import { nanoid } from 'nanoid'
import type { PinceauRuntimeIds } from './types'

export function usePinceauRuntimeIds(
  el: HTMLElement,
  scopeId?: boolean,
): PinceauRuntimeIds {
  let uid = ''

  // Resolve uid from element classList
  if (el && el.classList) {
    el.classList.forEach(
      (elClass: string) => {
        if (uid) { return }
        const match = /^pc-(.*)/.exec(elClass)
        if (match && match?.[1]) { uid = match[1] }
      },
    )
  }

  // Get a new uuid if none found
  if (!uid) { uid = nanoid(6) }

  const ids = {
    uid,
    uniqueClassName: `pc-${uid}`,
    componentId: scopeId ? `[${scopeId}]` : '',
  }

  return ids
}
