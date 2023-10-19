import { dirname } from 'pathe'
import type { PinceauContext, VirtualOutputs } from '../types'

/**
 * Write a virtual output.
 */
export function writeOutput(
  id: string,
  path: string,
  ctx: PinceauContext,
) {
  if (!ctx.fs) { return }

  // Create target directory if it doesn't already exist.
  const targetDir = dirname(path)
  if (!ctx.fs.existsSync(targetDir)) { ctx.fs.mkdirSync(targetDir, { recursive: true }) }
  if (ctx.outputs[id]) { ctx.fs.writeFileSync(path, ctx.outputs[id]) }
}
