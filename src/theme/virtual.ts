import type { PinceauVirtualContext, ThemeGenerationOutput } from '../types'
import { jsFull, tsFull } from './formats'

const VIRTUAL_ENTRY_REGEX = /^(?:virtual:)?pinceau\.(css|ts)(\?.*)?$/
export const RESOLVED_ID_RE = /\/__pinceau(?:(_.*?))?\.(css|ts)(\?.*)?$/

export default function usePinceauVirtualStore(): PinceauVirtualContext {
  const outputs: ThemeGenerationOutput['outputs'] = {
    '_css': '/* This file is empty because no tokens has been provided. */',
    '_ts': tsFull({}, {}),
    '_js': jsFull({}, {}),
    '_json': '{}',
    '_aliases': '{}'
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
    if (id.match(RESOLVED_ID_RE)) {
      return id
    }
    const match = id.match(VIRTUAL_ENTRY_REGEX)
    if (match) {
      return match[1]
        ? `/__pinceau_${match[1]}.${match[1]}`
        : '/__pinceau_css.css'
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
