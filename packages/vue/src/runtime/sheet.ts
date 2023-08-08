import { getSheet, makeStyleTag } from './dom'

export interface SheetOptions {
  id: string
  target?: HTMLElement | undefined
  isServer: boolean
}

export interface StyleTag {
  id: string
  insertRule(index: number, rule: string): boolean
  deleteRule(index: number): void
  getRule(index: number): string
  length: number
}

export const CSSOMTag = class CSSOMTag implements StyleTag {
  id: string

  element: HTMLStyleElement

  sheet: CSSStyleSheet

  length: number

  constructor(id: string, target?: HTMLElement | undefined) {
    this.id = id

    this.element = makeStyleTag(id, target)

    // Avoid Edge bug where empty style elements don't create sheets
    this.element.appendChild(document.createTextNode(''))

    this.sheet = getSheet(this.element)
    this.length = 0
  }

  insertRule(index: number, rule: string): boolean {
    try {
      this.sheet.insertRule(rule, index)
      this.length++
      return true
    }
    catch (_error) {
      return false
    }
  }

  deleteRule(index: number): void {
    this.sheet.deleteRule(index)
    this.length--
  }

  getRule(index: number): string {
    const rule = this.sheet.cssRules[index]

    // Avoid IE11 quirk where cssText is inaccessible on some invalid rules
    if (rule && rule.cssText) {
      return rule.cssText
    }
    else {
      return ''
    }
  }
}

/** A completely virtual (server-side) Tag that doesn't manipulate the DOM */
export const VirtualTag = class VirtualStyleTag implements StyleTag {
  id: string

  rules: string[]

  length: number

  constructor(id: string, _target?: HTMLElement | undefined) {
    this.id = id
    this.rules = []
    this.length = 0
  }

  insertRule(index: number, rule: string) {
    if (index <= this.length) {
      this.rules.splice(index, 0, rule)
      this.length++
      return true
    }
    else {
      return false
    }
  }

  deleteRule(index: number) {
    this.rules.splice(index, 1)
    this.length--
  }

  getRule(index: number) {
    if (index < this.length) {
      return this.rules[index]
    }
    else {
      return ''
    }
  }
}

/** Create a CSSStyleSheet-like tag depending on the environment */
export function getStyleTag({ isServer, target, id }: SheetOptions) {
  if (isServer) {
    return new VirtualTag(id, target)
  }
  else {
    return new CSSOMTag(id, target)
  }
}
