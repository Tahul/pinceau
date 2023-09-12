export type PinceauQueryBlockType = 'script' | 'template' | 'style' | 'custom' | 'global'

export interface PinceauQuery {
  // Extracted data
  id: string
  filename: string
  ext: string

  // Extraneous parameters
  global?: boolean
  src?: boolean
  raw?: boolean

  // Vue Query parameters
  vueQuery?: boolean
  type?: PinceauQueryBlockType
  index?: number
  setup?: boolean
  scoped?: string

  // Has this block been processed through Pinceau
  transformed?: boolean

  // Is target direct css function?
  styleFunction?: string

  // File language
  lang?: string

  // Is target transformable?
  transformable?: boolean

  // Is target a SFC component?
  sfc?: 'vue' | false
}
