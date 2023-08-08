const PINCEAU_ATTR = 'data-pinceau'
const PINCEAU_ATTR_ACTIVE = 'active'
const PINCEAU_VERSION_ATTR = 'data-pinceau-version'
const PINCEAU_VERSION = '1.0.0'

/** Find last style element if any inside target */
function findLastStyleTag(id: string, target: HTMLElement): void | HTMLStyleElement {
  const arr = Array.from(target.querySelectorAll<HTMLStyleElement>(`style${id}`))

  return arr[arr.length - 1]
}

/** Create a style element inside `target` or <head> after the last */
export function makeStyleTag(id: string, target?: HTMLElement | undefined): HTMLStyleElement {
  const head = document.head
  const parent = target || head
  const style = document.createElement('style')
  style.id = id.split('#')[1]
  const prevStyle = findLastStyleTag(id, parent)
  const nextSibling = prevStyle !== undefined ? prevStyle.nextSibling : null

  style.setAttribute(PINCEAU_ATTR, PINCEAU_ATTR_ACTIVE)
  style.setAttribute(PINCEAU_VERSION_ATTR, PINCEAU_VERSION)

  parent.insertBefore(style, nextSibling)

  return style
}

/** Get the CSSStyleSheet instance for a given style element */
export function getSheet(tag: HTMLStyleElement): CSSStyleSheet {
  if (tag.sheet) { return tag.sheet as any as CSSStyleSheet }

  // Avoid Firefox quirk where the style element might not have a sheet property
  const { styleSheets } = document
  for (let i = 0, l = styleSheets.length; i < l; i++) {
    const sheet = styleSheets[i]
    if (sheet.ownerNode === tag) {
      return sheet as any as CSSStyleSheet
    }
  }

  throw new Error('Could not get stylesheet!')
}
