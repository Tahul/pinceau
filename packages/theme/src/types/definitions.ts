export interface PinceauTokenDefinition {
  uri: string
  range: {
    start: number
    end: number
  }
}

export interface PinceauThemeDefinitions {
  [key: string]: PinceauTokenDefinition
}

export interface PinceauUtilsDefinition {
  [key: string]: string
}

export type PinceauImportsDefinition = string[]
