import type { File, Store } from '..'

export async function compileReactFile(
  store: Store,
  file: File,
) {
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

  console.log({
    code: transformed?.result?.()?.code,
  })

  return transformed?.result?.()?.code || code
}
