import { printAst, visitAst } from '@pinceau/core/utils'
import type { File } from '@babel/types'

export function resolveConfigImports(ast: File) {
  const imports: string[] = []

  // Find all imports from file
  visitAst(
    ast,
    {
      visitImportDeclaration(path) {
        imports.push(printAst(path as any).code)
        return this.traverse(path)
      },
    },
  )

  return imports
}
