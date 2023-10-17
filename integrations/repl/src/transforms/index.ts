import { type File, type Store, themeFile } from '../store'
import { compileSvelteFile } from './svelte'
import { transformTS } from './typescript'
import { compileVueFile } from './vue'

export const COMP_IDENTIFIER = '__sfc__'

export async function compileFile(
  store: Store,
  file: File,
): Promise<(string | Error)[]> {
  let { filename, code, compiled } = file

  if (filename === themeFile) { return [] }

  if (!code.trim()) { return [] }

  // Compile plain CSS
  if (filename.endsWith('.css')) {
    compiled.css = code
    return []
  }

  // Compile JS / TS / JSX / TSX
  if (filename.endsWith('.js') || filename.endsWith('.ts') || filename.endsWith('.tsx') || filename.endsWith('.jsx')) {
    if (filename.endsWith('.ts') || filename.endsWith('.tsx') || filename.endsWith('.jsx')) { code = await transformTS(code) }
    compiled.js = compiled.ssr = code
    return []
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
    return []
  }

  if (filename.endsWith('.vue')) {
    compileVueFile(store, file)
    return []
  }

  if (filename.endsWith('.svelte')) {
    compileSvelteFile(store, file)
  }

  return []
}
