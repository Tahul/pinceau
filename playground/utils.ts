export const utils = {
  "my": (value) => ({ marginTop: value, marginBottom: value }),
  "mx": (value) => ({ marginLeft: value, marginRight: value }),
  "px": (value) => ({ paddingLeft: value, paddingRight: value }),
  "py": (value) => ({ paddingTop: value, paddingBottom: value }),
  "pt": (value) => ({ paddingTop: value }),
  "truncate": {
    "overflow": "hidden",
    "textOverflow": "ellipsis",
    "whiteSpace": "nowrap"
},
  "stateColors": (value) => {
      return {
        color: `{color.${value}.500}`,
        backgroundColor: `{color.${value}.200}`
      };
    },
} as const

export type GeneratedPinceauUtils = typeof utils

export default utils