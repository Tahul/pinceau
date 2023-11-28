import type { File, Store } from '..'

export async function compileReactFile(
  store: Store,
  file: File,
) {
  if (!store.transformer) { return }

  const { code, filename, compiled } = file

  const transformed = await store.pinceauProvider.transformReact(filename, code)

  if (transformed) {
    if (transformed.state.styleFunctions) {
      let pinceauCss: string = ''
      for (const [_, styleFn] of Object.entries(transformed.state.styleFunctions)) {
        if (styleFn.css) {
          pinceauCss += `\n${styleFn.css}`
        }
      }
      if (pinceauCss) { compiled.css = pinceauCss }
    }
  }

  return transformed?.result?.()?.code || code
}
