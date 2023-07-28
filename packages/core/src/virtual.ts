import type { PinceauVirtualContext, VirtualOutputs } from './types'

export function usePinceauVirtualStore(): PinceauVirtualContext {
  const pathMap: VirtualOutputs = {}
  let outputs: VirtualOutputs = {}

  function registerOutput(
    importPath: string,
    virtualPath: string,
    content: string,
  ) {
    pathMap[virtualPath] = importPath
    outputs[importPath] = content
  }

  /**
   * Get outputs from the virtual storage
   */
  function getOutput(id: string) { return outputs[id] }

  /**
   * Resolves the virtual module id from an import like `pinceau.css` or `pinceau.ts`
   *
   * Uses `includes` in case it the import paths gets called with `?query=`.
   */
  function getOutputId(id: string) {
    for (const [virtualPath, importPath] of Object.entries(pathMap)) {
      if (virtualPath.includes(id)) { return importPath }
    }
  }

  return {
    get outputs() { return outputs },
    set outputs(v: VirtualOutputs) { outputs = v },
    registerOutput,
    getOutput,
    getOutputId,
    updateOutputs: (outputUpdate: Partial<VirtualOutputs>) => Object.assign(outputs, outputUpdate),
  }
}
