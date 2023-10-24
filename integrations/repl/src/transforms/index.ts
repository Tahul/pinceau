import { themeFile } from '../store'
import type { File, Store } from '../store'
import { compileReactFile } from './react'
import { compileSvelteFile } from './svelte'
import { transformTS } from './typescript'
import { compileVueFile } from './vue'

export const COMP_IDENTIFIER = '__sfc__'

export async function compileFile(
  store: Store,
  file: File,
): Promise<(string | Error)[]> {
  let { filename, code, compiled } = file

  if (filename === themeFile) {
    return []
  }

  if (!code.trim()) {
    return []
  }

  // Compile plain CSS
  if (filename.endsWith('.css')) {
    compiled.css = code
  }

  // Compile JS / TS / JSX / TSX
  if (filename.endsWith('.js') || filename.endsWith('.ts') || filename.endsWith('.tsx') || filename.endsWith('.jsx')) {
    if (filename.endsWith('.jsx') || filename.endsWith('.tsx')) {
      code = await compileReactFile(store, file)
    }
    if (filename.endsWith('.ts') || filename.endsWith('.tsx') || filename.endsWith('.jsx')) {
      try {
        code = await transformTS(code)
      }
      catch (e) {
        //
      }
    }
    compiled.js = compiled.ssr = code
  }

  if (filename.endsWith('.json')) {
    let parsed

    try {
      parsed = JSON.parse(code)
    }
    catch (err: any) {
      console.error(`Error parsing ${filename}`, err.message)
      return [err.message]
    }

    compiled.js = compiled.ssr = `export default ${JSON.stringify(parsed)}`
  }

  if (filename.endsWith('.vue')) {
    try {
      await compileVueFile(store, file)
    }
    catch (e) {
      //
    }
  }

  if (filename.endsWith('.svelte')) {
    try {
      await compileSvelteFile(store, file)
    }
    catch (e) {
      //
    }
  }

  return []
}
