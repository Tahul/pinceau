import type { PinceauVirtualContext, ThemeGenerationOutput } from '../types'

const VIRTUAL_ENTRY_REGEX = /^(?:virtual:)?pinceau\.(css|ts)(\?.*)?$/
export const RESOLVED_ID_RE = /\/__pinceau(?:(_.*?))?\.(css|ts)(\?.*)?$/

export default function usePinceauVirtualStore(): PinceauVirtualContext {
  const outputs: ThemeGenerationOutput['outputs'] = {}

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
