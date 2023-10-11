import { preprocess } from 'svelte/compiler'
import type { PinceauContext, PinceauQuery } from '@pinceau/core'

/**
 * Load a specific <style> block from a Vue SFC query.
 */
export async function loadComponentBlock(
  file: string,
  query: PinceauQuery,
  _: PinceauContext,
): Promise<string | undefined> {
  if (query.type === 'style') {
    let style: string | undefined
    await preprocess(
      file,
      {
        style: ({ content }) => {
          style = content
        },
      },
    )
    return style
  }

  if (query.type === 'template') {
    let template: string | undefined
    await preprocess(
      file,
      {
        markup: ({ content }) => {
          template = content
        },
      },
    )
    return template
  }

  if (query.type === 'script') {
    let script: string | undefined
    await preprocess(
      file,
      {
        script: ({ content }) => {
          script = content
        },
      },
    )
    return script
  }
}
