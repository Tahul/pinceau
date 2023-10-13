export const theme = {
  "color": {
    "primary": {
      "value": "red",
      "variable": "var(--color-primary)"
    }
  }
} as const

export type PinceauTheme = typeof theme

export type PinceauMediaQueries = "$dark" | "$light" | "$initial";

export type PinceauThemePaths = "$color.primary";

export default theme