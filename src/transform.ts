import MagicString from 'magic-string'
import { resolveScriptSetup, resolveStyle, resolveTemplate } from './transforms'
import type { PinceauContext } from './types'
import { parseVueComponent } from './utils/ast'

function exposedTransform(code: string, id: string) {
  // Resolve from parsing the <style lang="ts"> tag for current component
  const variants = {}
  const computedStyles = {}
  const magicString = new MagicString(code)

  const ctx = { $tokens: () => '', options: { colorSchemeMode: 'media' } } as PinceauContext

  // Parse component with compiler-sfc
  const parsedComponent = parseVueComponent(code, { filename: id })

  // Transform <style> blocks
  if (parsedComponent.descriptor.styles) { resolveStyle(id, parsedComponent, magicString, variants, computedStyles, ctx) }

  const hasRuntimeStyles = Object.keys(variants).length > 0 || Object.keys(computedStyles).length > 0

  // Transform <template> blocks
  if (parsedComponent.descriptor.template) { resolveTemplate(id, parsedComponent, magicString, hasRuntimeStyles) }

  // Transform <script setup> blocks
  if (parsedComponent.descriptor.scriptSetup) { resolveScriptSetup(id, parsedComponent, magicString, variants, computedStyles, parsedComponent.descriptor.scriptSetup.lang === 'ts') }

  return magicString.toString()
}

export { exposedTransform as transformSfc }
