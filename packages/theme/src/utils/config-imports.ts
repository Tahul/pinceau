import { printAst, visitAst } from '@pinceau/core/utils'
import type { File } from '@babel/types'

export function resolveConfigImports(ast: File) {
  const imports: string[] = []

  // Find all imports from file
  visitAst(
    ast,
    {
      visitImportDeclaration(path) {
        const code = printAst(path as any).code
        if (!['$pinceau', 'pinceau', '@pinceau'].some(path => code.includes(path))) {
          imports.push(code)
        }
        return this.traverse(path)
      },
    },
  )

  return imports
}
