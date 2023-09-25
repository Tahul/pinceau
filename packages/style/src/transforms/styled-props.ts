import type { PinceauContext, PinceauTransformContext } from '@pinceau/core'
import { resolveStylePropContext } from '../utils/style-prop-context'

export function transformStyledProps(
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
) {
  const { target } = transformContext

  if (!transformContext.state.styleFunctions) { transformContext.state.styleFunctions = {} }

  const extractor = pinceauContext.transformers[transformContext.query.ext]?.extractProp
  if (extractor) {
    const matchedProps = extractor(transformContext, 'styled')

    for (let i = 0; i < matchedProps.length; i++) {
      const prop = matchedProps[i]

      const start = prop.loc.start.offset
      const end = prop.loc.end.offset

      const id = `${target.type}${target.index}_styled${i}`

      const styledPropContext = resolveStylePropContext(
        transformContext,
        pinceauContext,
        prop,
        id,
      )

      if (!styledPropContext) { return }

      target.overwrite(start, end, '')

      target.appendRight(
        styledPropContext.loc.start.offset,
        `class="${styledPropContext?.className || ''}" pcsp`,
      )

      transformContext.state.styleFunctions[id] = styledPropContext
    }
  }
}
