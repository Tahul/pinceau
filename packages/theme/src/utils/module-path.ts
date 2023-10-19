import { dirname, extname } from 'pathe'
import type { PinceauContext } from '@pinceau/core'
import type { ConfigLayer } from '../types/config'

export function configSourceFromModulePath(path: string, ctx: PinceauContext): ConfigLayer | undefined {
  if (!ctx.resolve) { return }

  let pkgPath
  try {
    pkgPath = ctx.resolve(path)
  }
  catch (e) {
    // TODO: Debug messages
    // console.log({ e })
  }

  if (pkgPath) {
    const dir = dirname(pkgPath)
    const filename = pkgPath.replace(`${dir}/`, '')
    const ext = extname(filename)
    if (dir && filename && ext) { return { path: `${dir}/`, configFileName: filename.replace(ext, '') } }
  }

  return undefined
}
