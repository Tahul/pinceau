import type { ASTNode } from 'ast-types'
import type { PinceauSFCTransformContext } from '@pinceau/core'
import { astTypes, expressionToAst, printAst } from '@pinceau/core'

/**
 * Adds `$pinceau` to the root element class via transform
 *
 * 1 - Search for the first <tag> in the <template> content
 * 2 - Find the `:class` attribute if it exists
 * 3 - Parse `:class` content with recast and inject `$pinceau`
 * 4 - If no `:class` found, just push it at the end of the first tag
 * 5 - If $pinceau is already present somewhere in the template, just skip this transform
 */
export function transformAddPinceauClass(
  transformContext: PinceauSFCTransformContext,
) {
  const templateBlock = transformContext?.sfc?.template

  if (!templateBlock?.content) { return }

  // $pinceau class already here
  if (templateBlock.content.includes('$pinceau')) { return templateBlock.content }

  const firstTag = templateBlock.content.match(/<([a-zA-Z]+)([^>]+)*>/)

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

    const startIndex = templateBlock.loc.start.offset + (firstTag?.index || 0)
    transformContext.magicString.remove(startIndex, startIndex + firstTag[0].length)
    transformContext.magicString.appendRight(startIndex, result)
  }
}
