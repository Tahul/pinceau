import { dirname } from 'pathe'
import type { VirtualOutputs } from '../types'

/**
 * Write a virtual output.
 */
export function writeOutput(
  id: string,
  path: string,
  outputs: VirtualOutputs,
  fs: typeof import('node:fs'),
) {
  // Create target directory if it doesn't already exist.
  const targetDir = dirname(path)
  if (!fs.existsSync(targetDir)) { fs.mkdirSync(targetDir, { recursive: true }) }
  if (outputs[id]) { fs.writeFileSync(path, outputs[id]) }
}
