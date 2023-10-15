export interface PinceauVirtualContext {
  /**
   * Virtual outputs storage
   */
  outputs: VirtualOutputs
  /**
   *
   */
  writeOutput: (id: string, path: string) => void
  /**
   * Register a new output in the virtual storage
   */
  registerOutput: (importPath: string, virtualPath: string, content?: string) => void
  /**
   * Get an output by its id.
   */
  getOutput: (id: string) => any
  /**
   * Get an output id from its import path.
   */
  getOutputId: (id: string) => string | undefined
  /**
   * Update outputs in storage.
   */
  updateOutputs: (outputUpdate: VirtualOutputs) => any
}

/**
 * Virtual outputs storage model
 */
export type VirtualOutputs<T = string> = { [key in string]: T }
