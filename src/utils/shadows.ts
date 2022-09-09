import type { ShadowTokenValue } from '../types'

/*
{
  "color": "#0000000d",
  "type": "dropShadow",
  "x": "0",
  "y": "1",
  "blur": "2",
  "spread": "0"
}
*/

export const isShadowToken = (value: any): value is ShadowTokenValue => {
  return !!((value?.color || value?.type) && (value?.x || value?.y || value?.blur || value?.spread))
}

export const transformShadow = (value: ShadowTokenValue): string => {
  return `${value?.type === 'innerShadow' ? 'inset ' : ''}${value?.x || 0}px ${value?.y || 0}px ${value?.blur || 0}px ${value?.spread || 0}px ${value?.color || '#000000'}`
}
