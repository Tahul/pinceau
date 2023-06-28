import type { PinceauVirtualContext, VirtualImportsPaths, VirtualOutputs } from '@pinceau/shared'
import { tsFull, utilsFull } from './formats'

export const RESOLVED_ID_RE = /^(virtual:pinceau:|#)?\/__pinceau(?:(_.*?))?\.(css|ts|js)(\?.*)?$/

export function usePinceauVirtualStore(): PinceauVirtualContext {
  let outputs: VirtualOutputs = {
    css: '/* This file is empty because no tokens has been provided or the configuration is broken. */',
    ts: tsFull({}),
    utils: utilsFull({}),
    schema: 'export const schema = {}\n\export const GeneratedPinceauThemeSchema = typeof schema',
    definitions: 'export const definitions = {} as const',
    hmr: ''
      + 'import { updateStyle } from \'/@vite/client\'\n'
      + `import.meta.hot.on(\'pinceau:theme\', theme => {
        if (theme?.css) { updateStyle(\'/__pinceau_css.css\', theme.css) }
        console.log({ theme })
      })`,
  }

  /**
   * Get outputs from the virtual storage
   */
  function getOutput(id: string) {
    if (id === '/__pinceau_css.css') { return outputs.css }
    if (id === '/__pinceau_ts.ts') { return outputs.ts }
    if (id === '/__pinceau_utils.ts') { return outputs.utils }
    if (id === '/__pinceau_schema.ts') { return outputs.schema }
    if (id === '/__pinceau_definitions.ts') { return outputs.definitions }
    if (id === '/__pinceau_hmr.ts') { return outputs.hmr }
  }

  /**
   * Resolves the virtual module id from an import like `pinceau.css` or `pinceau.ts`
   *
   * Uses `includes` in case it the import paths gets called with `?query=`.
   */
  function getOutputId(id: VirtualImportsPaths | string) {
    if (id.includes('pinceau.css')) { return '/__pinceau_css.css' }
    if (id.includes('#pinceau/theme')) { return '/__pinceau_ts.ts' }
    if (id.includes('#pinceau/utils')) { return '/__pinceau_utils.ts' }
    if (id.includes('#pinceau/schema')) { return '/__pinceau_schema.ts' }
    if (id.includes('#pinceau/definitions')) { return '/__pinceau_definitions.ts' }
    if (id.includes('#pinceau/hmr')) { return '/__pinceau_hmr.ts' }
  }

  return {
    get outputs() { return outputs },
    set outputs(v: VirtualOutputs) { outputs = v },
    getOutput,
    getOutputId,
    updateOutputs: (outputUpdate: Partial<VirtualOutputs>) => Object.assign(outputs, outputUpdate),
  }
}
