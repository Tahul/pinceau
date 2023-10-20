import type { Uri } from 'monaco-editor-core'
import { editor } from 'monaco-editor-core'

export function getOrCreateModel(
  uri: Uri,
  lang: string | undefined,
  value: string,
) {
  console.log({ uri: uri.path, lang, value })
  const model = editor.getModel(uri)
  if (model) {
    model.setValue(value)
    return model
  }
  // console.log('creating', uri)
  return editor.createModel(value, lang, uri)
}
