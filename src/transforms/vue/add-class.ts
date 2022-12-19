import type { ASTNode } from 'ast-types'
import { astTypes, expressionToAst, printAst } from '../../utils/ast'

/**
 * Adds `$pinceau` to the root element class via transform
 */
export function transformAddPinceauClass(code: string): string {
  // $pinceau class already here
  if (code.includes('$pinceau')) { return code }

  let firstTag: any = code.match(/<([a-zA-Z]+)([^>]+)*>/)

  if (firstTag?.[0]) {
    const _source = String(firstTag[0])
    if (_source.includes(':class')) {
      // Check for existing class, inject into it via AST if needed
      const existingAttr: ASTNode = _source.match(/:class="([^"]+)"/) as any
      if (existingAttr) {
        let attrAst = expressionToAst(existingAttr[1])
        const newAttrAst = astTypes.builders.identifier('$pinceau')
        switch (attrAst.type) {
          case 'ArrayExpression':
            attrAst.elements.push(newAttrAst)
            break
          case 'StringLiteral':
          case 'Literal':
            attrAst = astTypes.builders.arrayExpression([
              existingAttr as any,
            ])
            break
          case 'ObjectExpression':
            attrAst = astTypes.builders.arrayExpression([
              attrAst as any,
              newAttrAst,
            ])
            break
        }

        firstTag = _source.replace(existingAttr[1], printAst(attrAst).code)
      }
    }
    else if (_source.includes('/>')) {
      // Self closing tag
      firstTag = _source.replace('/>', ' :class="[$pinceau]" />')
    }
    else {
      // Regular tag
      firstTag = _source.replace('>', ' :class="[$pinceau]">')
    }

    code = code.replace(_source, firstTag)
  }

  return code
}
