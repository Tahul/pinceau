import { walkTemplate } from '@pinceau/core/utils'
import type { PinceauTransformContext, PropMatch } from '@pinceau/core'

export async function extractProp(
  transformContext: PinceauTransformContext,
  prop: string,
) {
  const matched: PropMatch[] = []

  if (!transformContext?.target?.ast) { return matched }

  // Vue parser will include `<template>` in `loc` blocks.
  // To preserve proper scoping, we scope the offset
  const startOffset = transformContext.target.ast.children[0].loc.start.offset
  const castLoc = (loc) => {
    return {
      start: {
        column: loc.start.line === 1 ? loc.start.column - startOffset : loc.start.column,
        line: loc.start.line > 1 ? loc.start.line - 1 : loc.start.line,
        offset: loc.start.offset - startOffset,
      },
      end: {
        column: loc.end.line === 1 ? loc.end.column - startOffset : loc.end.column,
        line: loc.end.line > 1 ? loc.end.line - 1 : loc.end.line,
        offset: loc.end.offset - startOffset,
      },
      source: loc.source,
    }
  }

  await walkTemplate(
    // In Vue context, the target block will have `ast` coming from Vue template parser.
    // We can walk this block using `ultrahtml` walk function as it has same parent/children shape.
    transformContext.target.ast,
    (node) => {
      const styledProp = node?.props?.find(attr => (attr?.name === prop) || (attr?.arg?.content === prop))

      if (styledProp) {
        matched.push({
          loc: castLoc(styledProp.loc),
          type: styledProp.type === '6' ? 'raw' : 'bind',
          content: styledProp?.value?.content || styledProp?.exp?.content,
        })
      }
    },
  )

  return matched
}
