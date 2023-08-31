import { nanoid } from 'nanoid'

export function createUniqueClass(devId?: string) {
  return `ps-${nanoid(6)}${devId ? `-${devId}` : ''}`
}
