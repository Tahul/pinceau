import { createRegExp, exactly, oneOrMore, word } from 'magic-regexp'
import type { PinceauVirtualContext, ThemeGenerationOutput } from '../types'
import reset from '../reset'

const resolveIdRegex = createRegExp(exactly('pinceau.').and(oneOrMore(word).as('extension')))
const virtualModuleRegex = createRegExp(exactly('virtual:pinceau.').and(oneOrMore(word).as('extension')))

const RESET_IMPORT_ID = 'pinceau/reset.css'
const RESET_ID = 'virtual:pinceau-reset.css'

export default function usePinceauVirtualStore(): PinceauVirtualContext {
  const outputs: ThemeGenerationOutput['outputs'] = {}

  function updateOutputs(generatedTheme: ThemeGenerationOutput) {
    Object.entries(generatedTheme.outputs).forEach(
      ([key, value]) => {
        outputs[key] = value
      },
    )
  }

  function getOutput(id: string) {
    let result
    if (id.includes(RESET_ID)) {
      result = reset
    }

    const matchId = virtualModuleRegex.exec(id)
    if (matchId) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, ext] = matchId
      result = outputs[ext]
    }

    return result
  }

  /**
   * Resolves the virtual module id from an import like `pinceau.css` or `pinceau.ts`
   */
  function getOutputId(id: string) {
    let result
    if (id.includes(RESET_IMPORT_ID)) {
      result = RESET_ID
    }

    const matchId = resolveIdRegex.exec(id)
    if (matchId) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, ext] = matchId
      result = `virtual:pinceau.${ext}`
    }

    return result
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
