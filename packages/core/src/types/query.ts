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
  type?: 'script' | 'template' | 'style' | 'custom'
  index?: number
  setup?: boolean
  scoped?: string
  transformed?: boolean

  // File language
  lang?: string

  // Is target style?
  styles?: boolean

  // Is target transformable?
  transformable?: boolean

  // Is target a SFC component?
  sfc?: 'vue' | false
}
