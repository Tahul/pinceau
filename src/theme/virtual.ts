import type { PinceauVirtualContext, ThemeGenerationOutput } from '../types'
import { tsFull, utilsFull } from './formats'

export const RESOLVED_ID_RE = /^(virtual:pinceau:|#)?\/__pinceau(?:(_.*?))?\.(css|ts|js)(\?.*)?$/

export function usePinceauVirtualStore(): PinceauVirtualContext {
  const outputs: ThemeGenerationOutput['outputs'] = {
    _css: '/* This file is empty because no tokens has been provided or the configuration is broken. */',
    _ts: tsFull({}),
    _utils: utilsFull({}),
    _schema: 'export const schema = {}\n\export const GeneratedPinceauThemeSchema = typeof schema',
    _definitions: 'export const definitions = {} as const',
  }

  function updateOutputs(generatedTheme: ThemeGenerationOutput) {
    Object.entries(generatedTheme.outputs).forEach(
      ([key, value]) => {
        outputs[`_${key}`] = value
      },
    )
  }

  function getOutput(id: string) {
    if (id === '/__pinceau_css.css') { return outputs._css }
    if (id === '/__pinceau_ts.ts') { return outputs._ts }
    if (id === '/__pinceau_utils.ts') { return outputs._utils }
    if (id === '/__pinceau_schema.ts') { return outputs._utils }
  }

  /**
   * Resolves the virtual module id from an import like `pinceau.css` or `pinceau.ts`
   */
  function getOutputId(id: string) {
    if (id.includes('pinceau.css')) { return '/__pinceau_css.css' }
    if (id.includes('#pinceau/theme')) { return '/__pinceau_ts.ts' }
    if (id.includes('#pinceau/utils')) { return '/__pinceau_utils.ts' }
    if (id.includes('#pinceau/schema')) { return '/__pinceau_schema.ts' }
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
