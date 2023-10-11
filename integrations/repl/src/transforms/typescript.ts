import { transform } from 'sucrase'

export async function transformTS(src: string) {
  return transform(
    src,
    {
      transforms: ['typescript', 'jsx'],
      jsxRuntime: 'classic',
      jsxImportSource: 'react',
      keepUnusedImports: true,

    },
  ).code
}
