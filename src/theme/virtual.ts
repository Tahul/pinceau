import type { PinceauVirtualContext, ThemeGenerationOutput } from '../types'
import { jsFlat, jsFull, tsFlat, tsFull } from './formats'

export const VIRTUAL_ENTRY_REGEX = /^(?:virtual:)?pinceau(__flat)?\.(css|ts|js)(\?.*)?$/
export const RESOLVED_ID_RE = /\/__pinceau(?:(_.*?))?\.(css|ts|js)(\?.*)?$/

export default function usePinceauVirtualStore(): PinceauVirtualContext {
  const outputs: ThemeGenerationOutput['outputs'] = {
    _css: '/* This file is empty because no tokens has been provided. */',
    _flat_ts: tsFlat({}, []),
    _flat_js: jsFlat({}, []),
    _ts: tsFull({}, []),
    _js: jsFull({}, []),
    _json: '{}',
    _aliases: '{}',
  }

  function updateOutputs(generatedTheme: ThemeGenerationOutput) {
    Object.entries(generatedTheme.outputs).forEach(
      ([key, value]) => {
        outputs[`_${key}`] = value
      },
    )
  }

  function getOutput(id: string) {
    const match = id.match(RESOLVED_ID_RE)
    if (match) {
      return outputs[match[1]]
    }
  }

  /**
   * Resolves the virtual module id from an import like `pinceau.css` or `pinceau.ts`
   */
  function getOutputId(id: string) {
    if (id.match(RESOLVED_ID_RE)) { return id }

    const match = id.match(VIRTUAL_ENTRY_REGEX)
    if (match) {
      // pinceau__flat.{css|ts|js}
      if (match[1] && match[2]) {
        return `/__pinceau_flat_${match[2]}.${match[2]}`
      }

      // pinceau.{css|js|ts}
      if (match[2]) {
        return `/__pinceau_${match[2]}.${match[2]}`
      }
    }
  }

  return {
    get outputs() {
      return outputs
    },
    updateOutputs,
    getOutput,
    getOutputId,
  }
}
