import type { Uri } from 'monaco-editor-core'
import { editor } from 'monaco-editor-core'

export function getOrCreateModel(
  uri: Uri,
  lang: string | undefined,
  value: string,
) {
  const model = editor.getModel(uri)
  if (uri.path.includes('@pinceau/outputs')) {
    console.log(uri.path)
  }
  if (model) {
    model.setValue(value)
    return model
  }
  return editor.createModel(value, lang, uri)
}
