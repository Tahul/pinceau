export const theme = {
  "color": {
    "primary": {
      "value": "red",
      "variable": "var(--color-primary)"
    }
  }
} as const

export type GeneratedPinceauTheme = typeof theme

export type GeneratedPinceauMediaQueries = "dark" | "light" | "initial";

export type GeneratedPinceauPaths = "color.primary";

export default theme