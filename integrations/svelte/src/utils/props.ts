import { walk as walkTemplate } from 'svelte/compiler'
import { createSourceLocationFromOffsets } from 'sfc-composer'
import { parse } from 'svelte/compiler'
import type { PinceauTransformContext, PropMatch } from '@pinceau/core'

export function extractProp(
  transformContext: PinceauTransformContext,
  prop: string,
) {
  const matched: PropMatch[] = []

  let sanitizedComponent = transformContext.target.toString()

  // In that step, we do not need the <script> part of the component, but we need Svelte HTML parser.
  // Svelte parser throws when encountering `ts` content as it needs preprocessing first, we need to get rid of it.
  // As it will be easier on resolving to preserve the LOC of the component, we replace the `<script lang="ts">` tags by empty spaces.
  for (const scriptTag of transformContext?.sfc?.scripts || []) {
    if (scriptTag.attrs.lang === 'ts') {
      const spaces = ' '.repeat(scriptTag._source.length)
      sanitizedComponent = sanitizedComponent.replace(scriptTag._source, spaces)
    }
  }

  walkTemplate(
    // @ts-expect-error - Strange typings from Svelte
    parse(sanitizedComponent).html,
    {
      enter: (node: any) => {
        // @ts-ignore - I'm looking for Attribute
        if (node.type === 'Attribute' && node.name === prop && node?.value?.[0]?.expression) {
          matched.push(
            {
              content: transformContext.ms.toString().substring(node.value[0].expression.start, node.value[0].expression.end),
              loc: createSourceLocationFromOffsets(
                transformContext.target.toString(),
                node.start - transformContext.target._loc.start.offset,
                node.end - transformContext.target._loc.start.offset,
              ),
              type: 'raw',
            },
          )
        }
      },
    },
  )

  return matched
}
