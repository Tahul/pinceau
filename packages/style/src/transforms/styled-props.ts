import type { PinceauContext, PinceauTransformContext, PinceauTransformFunction } from '@pinceau/core'
import { resolveStylePropContext } from '../utils/style-prop-context'

export const transformStyledProps: PinceauTransformFunction = async (
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
) => {
  const { target } = transformContext

  if (!transformContext.state.styleFunctions) { transformContext.state.styleFunctions = {} }

  const transformer = pinceauContext.transformers[transformContext.query.ext]

  if (transformer) {
    const matchedProps = await transformer.extractProp(transformContext, 'styled')

    for (let i = 0; i < matchedProps.length; i++) {
      const prop = matchedProps[i]

      const start = prop.loc.start.offset
      const end = prop.loc.end.offset

      const id = `${target.type}${target.index}_styled${i}`

      const styledPropContext = await resolveStylePropContext(
        transformContext,
        pinceauContext,
        prop,
        id,
      )

      if (!styledPropContext) { return }

      target.overwrite(start, end, '')

      target.appendRight(
        styledPropContext.loc.start.offset,
        transformer.classBinding(id, styledPropContext),
      )

      transformContext.state.styleFunctions[id] = styledPropContext
    }
  }
}
