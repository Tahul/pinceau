import type { Color } from 'chroma-js'
import chroma from 'chroma-js'
import type { PinceauTokens } from '../types'

export const palette = (
  color: string,
  suffixes: Array<string | number> = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
  padding = 0.1,
): PinceauTokens => {
  if (!color || typeof color !== 'string') {
    throw new Error('Please provide a valid "color" string parameter')
  }

  function scalePalette(baseColor: Color | string, _suffixes: Array<string | number> = suffixes, _padding: number = padding) {
    const colorScale = chroma.scale(['white', baseColor, 'black']).padding(padding).colors(suffixes.length)

    const colorRange: PinceauTokens = {}

    suffixes.forEach(
      (suffix, index) => (
        colorRange[suffix] = {
          value: colorScale[index],
        }
      ),
    )

    colorRange[500] = {
      value: baseColor as string,
    }

    return colorRange
  }

  return {
    ...scalePalette(color),
    // @ts-expect-error - Mark tokens object as palette generated
    palette: true,
  }
}
