import type { ResponsiveProp } from '@pinceau/style'
import type { PropType } from 'vue'

/**
 * A prop to be used on any component to enable `:css` prop.
 */
export function responsiveProp<T extends string>(
  defaultValue: ResponsiveProp<T>,
  required = false,
) {
  return {
    type: [String, Object] as PropType<ResponsiveProp<T>>,
    default: defaultValue,
    required,
  }
}
