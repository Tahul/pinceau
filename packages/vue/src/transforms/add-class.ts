import type { ASTNode } from 'ast-types'
import type { PinceauTransformContext, PinceauTransformFunction } from '@pinceau/core'
import { astTypes, expressionToAst, printAst } from '@pinceau/core/utils'

/**
 * Adds `$pinceau` to the root element class via transform
 *
 * 1 - Search for the first <tag> in the <template> content
 * 2 - Find the `:class` attribute if it exists
 * 3 - Parse `:class` content with recast and inject `$pinceau`
 * 4 - If no `:class` found, just push it at the end of the first tag
 * 5 - If $pinceau is already present somewhere in the template, just skip this transform
 */
export const transformAddPinceauClass: PinceauTransformFunction = (
  transformContext: PinceauTransformContext,
) => {
  const { target } = transformContext

  const content = target.toString()

  // $pinceau class already here
  if (content.includes('$pinceau')) { return }

  const firstTag = content.match(/<([a-zA-Z]+)([^>]+)*>/)

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

    target.overwrite((firstTag as any).index, (firstTag as any).index + firstTag[0].length, result)
  }
}
