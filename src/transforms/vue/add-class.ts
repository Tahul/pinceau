import type { ASTNode } from 'ast-types'
import type { PinceauTransformContext } from 'pinceau/types'
import { astTypes, expressionToAst, printAst } from '../../utils/ast'

/**
 * Adds `$pinceau` to the root element class via transform
 *
 * 1 - Search for the first <tag> in the <template> content
 * 2 - Find the `:class` attribute if it exists
 * 3 - Parse `:class` content with recast and inject `$pinceau`
 * 4 - If no `:class` found, just push it at the end of the first tag
 * 5 - If $pinceau is already present somewhere in the template, just skip this transform
 */
export function transformAddPinceauClass(transformContext: PinceauTransformContext): string {
  const code = transformContext.sfc.descriptor.template.content

  if (!code) { return }

  // $pinceau class already here
  if (code.includes('$pinceau')) { return code }

  const firstTag = code.match(/<([a-zA-Z]+)([^>]+)*>/)

  let result = ''

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

        result = _source.replace(existingAttr[1], printAst(attrAst).code)
      }
    }
    else if (_source.includes('/>')) {
      // Self closing tag
      result = _source.replace('/>', ' :class="[$pinceau]" />')
    }
    else {
      // Regular tag
      result = _source.replace('>', ' :class="[$pinceau]">')
    }

    transformContext.replace(_source, result)
  }

  return code
}
