import type { PermissiveConfigType } from 'pinceau'

export const theme = {
  "media": {
    "sm": {
      "value": "(min-width: 640px)",
      "variable": "var(--media-sm)",
      "original": "(min-width: 640px)"
    },
    "md": {
      "value": "(min-width: 768px)",
      "variable": "var(--media-md)",
      "original": "(min-width: 768px)"
    },
    "lg": {
      "value": "(min-width: 1024px)",
      "variable": "var(--media-lg)",
      "original": "(min-width: 1024px)"
    },
    "xl": {
      "value": "(min-width: 1280px)",
      "variable": "var(--media-xl)",
      "original": "(min-width: 1280px)"
    },
    "xxl": {
      "value": "(min-width: 1536px)",
      "variable": "var(--media-xxl)",
      "original": "(min-width: 1536px)"
    }
  },
  "font": {
    "primary": {
      "value": "Inter, sans-serif",
      "variable": "var(--font-primary)",
      "original": "Inter, sans-serif"
    },
    "secondary": {
      "value": "FredokaOne, serif",
      "variable": "var(--font-secondary)",
      "original": "FredokaOne, serif"
    }
  },
  "color": {
    "white": {
      "value": "#FFFFFF",
      "variable": "var(--color-white)",
      "original": "#FFFFFF"
    },
    "black": {
      "value": "#191919",
      "variable": "var(--color-black)",
      "original": "#191919"
    },
    "pink": {
      "50": {
        "value": "#fbdce8",
        "variable": "var(--color-pink-50)",
        "original": "#fbdce8"
      },
      "100": {
        "value": "#f8bed4",
        "variable": "var(--color-pink-100)",
        "original": "#f8bed4"
      },
      "200": {
        "value": "#f49fc0",
        "variable": "var(--color-pink-200)",
        "original": "#f49fc0"
      },
      "300": {
        "value": "#f180ab",
        "variable": "var(--color-pink-300)",
        "original": "#f180ab"
      },
      "400": {
        "value": "#ee6197",
        "variable": "var(--color-pink-400)",
        "original": "#ee6197"
      },
      "500": {
        "value": "#EC528D",
        "variable": "var(--color-pink-500)",
        "original": "#EC528D"
      },
      "600": {
        "value": "#ad3c67",
        "variable": "var(--color-pink-600)",
        "original": "#ad3c67"
      },
      "700": {
        "value": "#832e4e",
        "variable": "var(--color-pink-700)",
        "original": "#832e4e"
      },
      "800": {
        "value": "#591f35",
        "variable": "var(--color-pink-800)",
        "original": "#591f35"
      },
      "900": {
        "value": "#2f101c",
        "variable": "var(--color-pink-900)",
        "original": "#2f101c"
      }
    },
    "blue": {
      "50": {
        "value": "#d5ecf0",
        "variable": "var(--color-blue-50)",
        "original": "#d5ecf0"
      },
      "100": {
        "value": "#afdae2",
        "variable": "var(--color-blue-100)",
        "original": "#afdae2"
      },
      "200": {
        "value": "#89c9d5",
        "variable": "var(--color-blue-200)",
        "original": "#89c9d5"
      },
      "300": {
        "value": "#64b8c7",
        "variable": "var(--color-blue-300)",
        "original": "#64b8c7"
      },
      "400": {
        "value": "#3ea7ba",
        "variable": "var(--color-blue-400)",
        "original": "#3ea7ba"
      },
      "500": {
        "value": "#2B9EB3",
        "variable": "var(--color-blue-500)",
        "original": "#2B9EB3"
      },
      "600": {
        "value": "#207483",
        "variable": "var(--color-blue-600)",
        "original": "#207483"
      },
      "700": {
        "value": "#185863",
        "variable": "var(--color-blue-700)",
        "original": "#185863"
      },
      "800": {
        "value": "#103c44",
        "variable": "var(--color-blue-800)",
        "original": "#103c44"
      },
      "900": {
        "value": "#092024",
        "variable": "var(--color-blue-900)",
        "original": "#092024"
      }
    },
    "yellow": {
      "50": {
        "value": "#feeecf",
        "variable": "var(--color-yellow-50)",
        "original": "#feeecf"
      },
      "100": {
        "value": "#fedfa5",
        "variable": "var(--color-yellow-100)",
        "original": "#fedfa5"
      },
      "200": {
        "value": "#fdd07a",
        "variable": "var(--color-yellow-200)",
        "original": "#fdd07a"
      },
      "300": {
        "value": "#fdc150",
        "variable": "var(--color-yellow-300)",
        "original": "#fdc150"
      },
      "400": {
        "value": "#fcb225",
        "variable": "var(--color-yellow-400)",
        "original": "#fcb225"
      },
      "500": {
        "value": "#FCAB10",
        "variable": "var(--color-yellow-500)",
        "original": "#FCAB10"
      },
      "600": {
        "value": "#b97d0c",
        "variable": "var(--color-yellow-600)",
        "original": "#b97d0c"
      },
      "700": {
        "value": "#8c5f09",
        "variable": "var(--color-yellow-700)",
        "original": "#8c5f09"
      },
      "800": {
        "value": "#5f4106",
        "variable": "var(--color-yellow-800)",
        "original": "#5f4106"
      },
      "900": {
        "value": "#322203",
        "variable": "var(--color-yellow-900)",
        "original": "#322203"
      }
    },
    "red": {
      "50": {
        "value": "#fed6d8",
        "variable": "var(--color-red-50)",
        "original": "#fed6d8"
      },
      "100": {
        "value": "#fcb2b5",
        "variable": "var(--color-red-100)",
        "original": "#fcb2b5"
      },
      "200": {
        "value": "#fb8e93",
        "variable": "var(--color-red-200)",
        "original": "#fb8e93"
      },
      "300": {
        "value": "#fa6970",
        "variable": "var(--color-red-300)",
        "original": "#fa6970"
      },
      "400": {
        "value": "#f9454d",
        "variable": "var(--color-red-400)",
        "original": "#f9454d"
      },
      "500": {
        "value": "#F8333C",
        "variable": "var(--color-red-500)",
        "original": "#F8333C"
      },
      "600": {
        "value": "#b6252c",
        "variable": "var(--color-red-600)",
        "original": "#b6252c"
      },
      "700": {
        "value": "#8a1c21",
        "variable": "var(--color-red-700)",
        "original": "#8a1c21"
      },
      "800": {
        "value": "#5e1317",
        "variable": "var(--color-red-800)",
        "original": "#5e1317"
      },
      "900": {
        "value": "#320a0c",
        "variable": "var(--color-red-900)",
        "original": "#320a0c"
      }
    },
    "grey": {
      "50": {
        "value": "#f8f7f0",
        "variable": "var(--color-grey-50)",
        "original": "#f8f7f0"
      },
      "100": {
        "value": "#f1efe3",
        "variable": "var(--color-grey-100)",
        "original": "#f1efe3"
      },
      "200": {
        "value": "#ebe8d6",
        "variable": "var(--color-grey-200)",
        "original": "#ebe8d6"
      },
      "300": {
        "value": "#e5e0c9",
        "variable": "var(--color-grey-300)",
        "original": "#e5e0c9"
      },
      "400": {
        "value": "#ded9bc",
        "variable": "var(--color-grey-400)",
        "original": "#ded9bc"
      },
      "500": {
        "value": "#DBD5B5",
        "variable": "var(--color-grey-500)",
        "original": "#DBD5B5"
      },
      "600": {
        "value": "#a19c85",
        "variable": "var(--color-grey-600)",
        "original": "#a19c85"
      },
      "700": {
        "value": "#7a7665",
        "variable": "var(--color-grey-700)",
        "original": "#7a7665"
      },
      "800": {
        "value": "#535044",
        "variable": "var(--color-grey-800)",
        "original": "#535044"
      },
      "900": {
        "value": "#2c2b24",
        "variable": "var(--color-grey-900)",
        "original": "#2c2b24"
      }
    },
    "green": {
      "50": {
        "value": "#daefe1",
        "variable": "var(--color-green-50)",
        "original": "#daefe1"
      },
      "100": {
        "value": "#b8e1c6",
        "variable": "var(--color-green-100)",
        "original": "#b8e1c6"
      },
      "200": {
        "value": "#97d3ac",
        "variable": "var(--color-green-200)",
        "original": "#97d3ac"
      },
      "300": {
        "value": "#76c491",
        "variable": "var(--color-green-300)",
        "original": "#76c491"
      },
      "400": {
        "value": "#55b676",
        "variable": "var(--color-green-400)",
        "original": "#55b676"
      },
      "500": {
        "value": "#44AF69",
        "variable": "var(--color-green-500)",
        "original": "#44AF69"
      },
      "600": {
        "value": "#32804d",
        "variable": "var(--color-green-600)",
        "original": "#32804d"
      },
      "700": {
        "value": "#26613a",
        "variable": "var(--color-green-700)",
        "original": "#26613a"
      },
      "800": {
        "value": "#1a4228",
        "variable": "var(--color-green-800)",
        "original": "#1a4228"
      },
      "900": {
        "value": "#0e2315",
        "variable": "var(--color-green-900)",
        "original": "#0e2315"
      }
    },
    "primary": {
      "100": {
        "value": {
          "initial": "var(--color-blue-100)",
          "dark": "var(--color-blue-900)"
        },
        "variable": "var(--color-primary-100)",
        "original": {
          "initial": "{color.blue.100}",
          "dark": "{color.blue.900}"
        }
      },
      "200": {
        "value": {
          "initial": "var(--color-blue-200)",
          "dark": "var(--color-blue-800)"
        },
        "variable": "var(--color-primary-200)",
        "original": {
          "initial": "{color.blue.200}",
          "dark": "{color.blue.800}"
        }
      },
      "300": {
        "value": {
          "initial": "var(--color-blue-300)",
          "dark": "var(--color-blue-700)"
        },
        "variable": "var(--color-primary-300)",
        "original": {
          "initial": "{color.blue.300}",
          "dark": "{color.blue.700}"
        }
      },
      "400": {
        "value": {
          "initial": "var(--color-blue-400)",
          "dark": "var(--color-blue-600)"
        },
        "variable": "var(--color-primary-400)",
        "original": {
          "initial": "{color.blue.400}",
          "dark": "{color.blue.600}"
        }
      },
      "500": {
        "value": {
          "initial": "var(--color-blue-500)",
          "dark": "var(--color-blue-500)"
        },
        "variable": "var(--color-primary-500)",
        "original": {
          "initial": "{color.blue.500}",
          "dark": "{color.blue.500}"
        }
      },
      "600": {
        "value": {
          "initial": "var(--color-blue-600)",
          "dark": "var(--color-blue-400)"
        },
        "variable": "var(--color-primary-600)",
        "original": {
          "initial": "{color.blue.600}",
          "dark": "{color.blue.400}"
        }
      },
      "700": {
        "value": {
          "initial": "var(--color-blue-700)",
          "dark": "var(--color-blue-300)"
        },
        "variable": "var(--color-primary-700)",
        "original": {
          "initial": "{color.blue.700}",
          "dark": "{color.blue.300}"
        }
      },
      "800": {
        "value": {
          "initial": "var(--color-blue-800)",
          "dark": "var(--color-blue-200)"
        },
        "variable": "var(--color-primary-800)",
        "original": {
          "initial": "{color.blue.800}",
          "dark": "{color.blue.200}"
        }
      },
      "900": {
        "value": {
          "initial": "var(--color-blue-900)",
          "dark": "var(--color-blue-100)"
        },
        "variable": "var(--color-primary-900)",
        "original": {
          "initial": "{color.blue.900}",
          "dark": "{color.blue.100}"
        }
      }
    },
    "testSimple": {
      "value": "violet",
      "variable": "var(--color-testSimple)",
      "original": "violet"
    },
    "test": {
      "value": {
        "initial": "red",
        "dark": "blue"
      },
      "variable": "var(--color-test)",
      "original": {
        "initial": "red",
        "dark": "blue"
      }
    },
    "testReference": {
      "value": "var(--color-testSimple)",
      "variable": "var(--color-testReference)",
      "original": "{color.testSimple}"
    },
    "testSimpleReference": {
      "value": "var(--color-test)",
      "variable": "var(--color-testSimpleReference)",
      "original": "{color.test}"
    }
  },
  "shadow": {
    "xs": {
      "value": "0 1px 2px 0 var(--color-grey-800)",
      "variable": "var(--shadow-xs)",
      "original": "0 1px 2px 0 {color.grey.800}"
    },
    "sm": {
      "value": "0 1px 2px -1px var(--color-grey-800), 0 1px 3px 0 var(--color-grey-800)",
      "variable": "var(--shadow-sm)",
      "original": "0 1px 2px -1px {color.grey.800}, 0 1px 3px 0 {color.grey.800}"
    },
    "md": {
      "value": "0 2px 4px -2px var(--color-grey-800), 0 4px 6px -1px var(--color-grey-800)",
      "variable": "var(--shadow-md)",
      "original": "0 2px 4px -2px {color.grey.800}, 0 4px 6px -1px {color.grey.800}"
    },
    "lg": {
      "value": "0 4px 6px -4px var(--color-grey-800), 0 10px 15px -3px var(--color-grey-800)",
      "variable": "var(--shadow-lg)",
      "original": "0 4px 6px -4px {color.grey.800}, 0 10px 15px -3px {color.grey.800}"
    },
    "xl": {
      "value": "0 8px 10px -6px var(--color-grey-800), 0 20px 25px -5px var(--color-grey-800)",
      "variable": "var(--shadow-xl)",
      "original": "0 8px 10px -6px {color.grey.800}, 0 20px 25px -5px {color.grey.800}"
    },
    "xxl": {
      "value": "0 25px 50px -12px var(--color-grey-800)",
      "variable": "var(--shadow-xxl)",
      "original": "0 25px 50px -12px {color.grey.800}"
    }
  },
  "fontWeight": {
    "thin": {
      "value": 100,
      "variable": "var(--fontWeight-thin)",
      "original": 100
    },
    "extralight": {
      "value": 200,
      "variable": "var(--fontWeight-extralight)",
      "original": 200
    },
    "light": {
      "value": 300,
      "variable": "var(--fontWeight-light)",
      "original": 300
    },
    "normal": {
      "value": 400,
      "variable": "var(--fontWeight-normal)",
      "original": 400
    },
    "medium": {
      "value": 500,
      "variable": "var(--fontWeight-medium)",
      "original": 500
    },
    "semibold": {
      "value": 600,
      "variable": "var(--fontWeight-semibold)",
      "original": 600
    },
    "bold": {
      "value": 700,
      "variable": "var(--fontWeight-bold)",
      "original": 700
    },
    "extrabold": {
      "value": 800,
      "variable": "var(--fontWeight-extrabold)",
      "original": 800
    },
    "black": {
      "value": 900,
      "variable": "var(--fontWeight-black)",
      "original": 900
    }
  },
  "fontSize": {
    "xs": {
      "value": "12px",
      "variable": "var(--fontSize-xs)",
      "original": "12px"
    },
    "sm": {
      "value": "14px",
      "variable": "var(--fontSize-sm)",
      "original": "14px"
    },
    "base": {
      "value": "16px",
      "variable": "var(--fontSize-base)",
      "original": "16px"
    },
    "lg": {
      "value": "18px",
      "variable": "var(--fontSize-lg)",
      "original": "18px"
    },
    "xl": {
      "value": "20px",
      "variable": "var(--fontSize-xl)",
      "original": "20px"
    },
    "xxl": {
      "value": "24px",
      "variable": "var(--fontSize-xxl)",
      "original": "24px"
    },
    "3xl": {
      "value": "30px",
      "variable": "var(--fontSize-3xl)",
      "original": "30px"
    },
    "4xl": {
      "value": "36px",
      "variable": "var(--fontSize-4xl)",
      "original": "36px"
    },
    "5xl": {
      "value": "48px",
      "variable": "var(--fontSize-5xl)",
      "original": "48px"
    },
    "6xl": {
      "value": "60px",
      "variable": "var(--fontSize-6xl)",
      "original": "60px"
    },
    "7xl": {
      "value": "72px",
      "variable": "var(--fontSize-7xl)",
      "original": "72px"
    },
    "8xl": {
      "value": "96px",
      "variable": "var(--fontSize-8xl)",
      "original": "96px"
    },
    "9xl": {
      "value": "128px",
      "variable": "var(--fontSize-9xl)",
      "original": "128px"
    }
  },
  "letterSpacing": {
    "tighter": {
      "value": "-.05em",
      "variable": "var(--letterSpacing-tighter)",
      "original": "-.05em"
    },
    "tight": {
      "value": "-0025em",
      "variable": "var(--letterSpacing-tight)",
      "original": "-0025em"
    },
    "normal": {
      "value": "0em",
      "variable": "var(--letterSpacing-normal)",
      "original": "0em"
    },
    "wide": {
      "value": "0025em",
      "variable": "var(--letterSpacing-wide)",
      "original": "0025em"
    },
    "wider": {
      "value": ".05em",
      "variable": "var(--letterSpacing-wider)",
      "original": ".05em"
    },
    "widest": {
      "value": "0.1em",
      "variable": "var(--letterSpacing-widest)",
      "original": "0.1em"
    }
  },
  "lead": {
    "none": {
      "value": 1,
      "variable": "var(--lead-none)",
      "original": 1
    },
    "tight": {
      "value": 1.25,
      "variable": "var(--lead-tight)",
      "original": 1.25
    },
    "snug": {
      "value": 1.375,
      "variable": "var(--lead-snug)",
      "original": 1.375
    },
    "normal": {
      "value": 1.5,
      "variable": "var(--lead-normal)",
      "original": 1.5
    },
    "relaxed": {
      "value": 1.625,
      "variable": "var(--lead-relaxed)",
      "original": 1.625
    },
    "loose": {
      "value": 2,
      "variable": "var(--lead-loose)",
      "original": 2
    }
  },
  "radii": {
    "2xs": {
      "value": "0.125rem",
      "variable": "var(--radii-2xs)",
      "original": "0.125rem"
    },
    "xs": {
      "value": "0.25rem",
      "variable": "var(--radii-xs)",
      "original": "0.25rem"
    },
    "sm": {
      "value": "0.375rem",
      "variable": "var(--radii-sm)",
      "original": "0.375rem"
    },
    "md": {
      "value": "0.5rem",
      "variable": "var(--radii-md)",
      "original": "0.5rem"
    },
    "lg": {
      "value": "1rem",
      "variable": "var(--radii-lg)",
      "original": "1rem"
    },
    "xl": {
      "value": "1rem",
      "variable": "var(--radii-xl)",
      "original": "1rem"
    },
    "xxl": {
      "value": "1.5rem",
      "variable": "var(--radii-xxl)",
      "original": "1.5rem"
    },
    "full": {
      "value": "9999px",
      "variable": "var(--radii-full)",
      "original": "9999px"
    }
  },
  "size": {
    "4": {
      "value": "4px",
      "variable": "var(--size-4)",
      "original": "4px"
    },
    "6": {
      "value": "6px",
      "variable": "var(--size-6)",
      "original": "6px"
    },
    "8": {
      "value": "8px",
      "variable": "var(--size-8)",
      "original": "8px"
    },
    "12": {
      "value": "12px",
      "variable": "var(--size-12)",
      "original": "12px"
    },
    "16": {
      "value": "16px",
      "variable": "var(--size-16)",
      "original": "16px"
    },
    "20": {
      "value": "20px",
      "variable": "var(--size-20)",
      "original": "20px"
    },
    "24": {
      "value": "24px",
      "variable": "var(--size-24)",
      "original": "24px"
    },
    "32": {
      "value": "32px",
      "variable": "var(--size-32)",
      "original": "32px"
    },
    "40": {
      "value": "40px",
      "variable": "var(--size-40)",
      "original": "40px"
    },
    "48": {
      "value": "48px",
      "variable": "var(--size-48)",
      "original": "48px"
    },
    "56": {
      "value": "56px",
      "variable": "var(--size-56)",
      "original": "56px"
    },
    "64": {
      "value": "64px",
      "variable": "var(--size-64)",
      "original": "64px"
    },
    "80": {
      "value": "80px",
      "variable": "var(--size-80)",
      "original": "80px"
    },
    "104": {
      "value": "104px",
      "variable": "var(--size-104)",
      "original": "104px"
    },
    "200": {
      "value": "200px",
      "variable": "var(--size-200)",
      "original": "200px"
    }
  },
  "space": {
    "0": {
      "value": "0",
      "variable": "var(--space-0)",
      "original": "0"
    },
    "1": {
      "value": "1px",
      "variable": "var(--space-1)",
      "original": "1px"
    },
    "2": {
      "value": "2px",
      "variable": "var(--space-2)",
      "original": "2px"
    },
    "4": {
      "value": "4px",
      "variable": "var(--space-4)",
      "original": "4px"
    },
    "6": {
      "value": "6px",
      "variable": "var(--space-6)",
      "original": "6px"
    },
    "8": {
      "value": "8px",
      "variable": "var(--space-8)",
      "original": "8px"
    },
    "10": {
      "value": "10px",
      "variable": "var(--space-10)",
      "original": "10px"
    },
    "12": {
      "value": "12px",
      "variable": "var(--space-12)",
      "original": "12px"
    },
    "16": {
      "value": "16px",
      "variable": "var(--space-16)",
      "original": "16px"
    },
    "20": {
      "value": "20px",
      "variable": "var(--space-20)",
      "original": "20px"
    },
    "24": {
      "value": "24px",
      "variable": "var(--space-24)",
      "original": "24px"
    },
    "32": {
      "value": "32px",
      "variable": "var(--space-32)",
      "original": "32px"
    },
    "40": {
      "value": "40px",
      "variable": "var(--space-40)",
      "original": "40px"
    },
    "44": {
      "value": "44px",
      "variable": "var(--space-44)",
      "original": "44px"
    },
    "48": {
      "value": "48px",
      "variable": "var(--space-48)",
      "original": "48px"
    },
    "56": {
      "value": "56px",
      "variable": "var(--space-56)",
      "original": "56px"
    },
    "64": {
      "value": "64px",
      "variable": "var(--space-64)",
      "original": "64px"
    },
    "80": {
      "value": "80px",
      "variable": "var(--space-80)",
      "original": "80px"
    },
    "104": {
      "value": "104px",
      "variable": "var(--space-104)",
      "original": "104px"
    },
    "140": {
      "value": "140px",
      "variable": "var(--space-140)",
      "original": "140px"
    },
    "200": {
      "value": "200px",
      "variable": "var(--space-200)",
      "original": "200px"
    }
  },
  "borderWidth": {
    "noBorder": {
      "value": "0",
      "variable": "var(--borderWidth-noBorder)",
      "original": "0"
    },
    "sm": {
      "value": "1px",
      "variable": "var(--borderWidth-sm)",
      "original": "1px"
    },
    "md": {
      "value": "2px",
      "variable": "var(--borderWidth-md)",
      "original": "2px"
    },
    "lg": {
      "value": "3px",
      "variable": "var(--borderWidth-lg)",
      "original": "3px"
    }
  },
  "opacity": {
    "noOpacity": {
      "value": "0",
      "variable": "var(--opacity-noOpacity)",
      "original": "0"
    },
    "bright": {
      "value": "0.1",
      "variable": "var(--opacity-bright)",
      "original": "0.1"
    },
    "light": {
      "value": "0.15",
      "variable": "var(--opacity-light)",
      "original": "0.15"
    },
    "soft": {
      "value": "0.3",
      "variable": "var(--opacity-soft)",
      "original": "0.3"
    },
    "medium": {
      "value": "0.5",
      "variable": "var(--opacity-medium)",
      "original": "0.5"
    },
    "high": {
      "value": "0.8",
      "variable": "var(--opacity-high)",
      "original": "0.8"
    },
    "total": {
      "value": "1",
      "variable": "var(--opacity-total)",
      "original": "1"
    }
  },
  "zIndex": {
    "0": {
      "value": "0",
      "variable": "var(--zIndex-0)",
      "original": "0"
    },
    "1": {
      "value": "1px",
      "variable": "var(--zIndex-1)",
      "original": "1px"
    },
    "2": {
      "value": "2px",
      "variable": "var(--zIndex-2)",
      "original": "2px"
    },
    "4": {
      "value": "4px",
      "variable": "var(--zIndex-4)",
      "original": "4px"
    },
    "6": {
      "value": "6px",
      "variable": "var(--zIndex-6)",
      "original": "6px"
    },
    "8": {
      "value": "8px",
      "variable": "var(--zIndex-8)",
      "original": "8px"
    },
    "10": {
      "value": "10px",
      "variable": "var(--zIndex-10)",
      "original": "10px"
    },
    "12": {
      "value": "12px",
      "variable": "var(--zIndex-12)",
      "original": "12px"
    },
    "16": {
      "value": "16px",
      "variable": "var(--zIndex-16)",
      "original": "16px"
    },
    "20": {
      "value": "20px",
      "variable": "var(--zIndex-20)",
      "original": "20px"
    },
    "24": {
      "value": "24px",
      "variable": "var(--zIndex-24)",
      "original": "24px"
    },
    "32": {
      "value": "32px",
      "variable": "var(--zIndex-32)",
      "original": "32px"
    },
    "40": {
      "value": "40px",
      "variable": "var(--zIndex-40)",
      "original": "40px"
    },
    "44": {
      "value": "44px",
      "variable": "var(--zIndex-44)",
      "original": "44px"
    },
    "48": {
      "value": "48px",
      "variable": "var(--zIndex-48)",
      "original": "48px"
    },
    "56": {
      "value": "56px",
      "variable": "var(--zIndex-56)",
      "original": "56px"
    },
    "64": {
      "value": "64px",
      "variable": "var(--zIndex-64)",
      "original": "64px"
    },
    "80": {
      "value": "80px",
      "variable": "var(--zIndex-80)",
      "original": "80px"
    },
    "104": {
      "value": "104px",
      "variable": "var(--zIndex-104)",
      "original": "104px"
    },
    "140": {
      "value": "140px",
      "variable": "var(--zIndex-140)",
      "original": "140px"
    },
    "200": {
      "value": "200px",
      "variable": "var(--zIndex-200)",
      "original": "200px"
    }
  }
} as const

export type GeneratedPinceauTheme = typeof theme

export type GeneratedPinceauPaths = "media.sm" | "media.md" | "media.lg" | "media.xl" | "media.xxl" | "font.primary" | "font.secondary" | "color.white" | "color.black" | "color.pink.50" | "color.pink.100" | "color.pink.200" | "color.pink.300" | "color.pink.400" | "color.pink.500" | "color.pink.600" | "color.pink.700" | "color.pink.800" | "color.pink.900" | "color.blue.50" | "color.blue.100" | "color.blue.200" | "color.blue.300" | "color.blue.400" | "color.blue.500" | "color.blue.600" | "color.blue.700" | "color.blue.800" | "color.blue.900" | "color.yellow.50" | "color.yellow.100" | "color.yellow.200" | "color.yellow.300" | "color.yellow.400" | "color.yellow.500" | "color.yellow.600" | "color.yellow.700" | "color.yellow.800" | "color.yellow.900" | "color.red.50" | "color.red.100" | "color.red.200" | "color.red.300" | "color.red.400" | "color.red.500" | "color.red.600" | "color.red.700" | "color.red.800" | "color.red.900" | "color.grey.50" | "color.grey.100" | "color.grey.200" | "color.grey.300" | "color.grey.400" | "color.grey.500" | "color.grey.600" | "color.grey.700" | "color.grey.800" | "color.grey.900" | "color.green.50" | "color.green.100" | "color.green.200" | "color.green.300" | "color.green.400" | "color.green.500" | "color.green.600" | "color.green.700" | "color.green.800" | "color.green.900" | "color.primary.100" | "color.primary.200" | "color.primary.300" | "color.primary.400" | "color.primary.500" | "color.primary.600" | "color.primary.700" | "color.primary.800" | "color.primary.900" | "color.testSimple" | "color.test" | "color.testReference" | "color.testSimpleReference" | "shadow.xs" | "shadow.sm" | "shadow.md" | "shadow.lg" | "shadow.xl" | "shadow.xxl" | "fontWeight.thin" | "fontWeight.extralight" | "fontWeight.light" | "fontWeight.normal" | "fontWeight.medium" | "fontWeight.semibold" | "fontWeight.bold" | "fontWeight.extrabold" | "fontWeight.black" | "fontSize.xs" | "fontSize.sm" | "fontSize.base" | "fontSize.lg" | "fontSize.xl" | "fontSize.xxl" | "fontSize.3xl" | "fontSize.4xl" | "fontSize.5xl" | "fontSize.6xl" | "fontSize.7xl" | "fontSize.8xl" | "fontSize.9xl" | "letterSpacing.tighter" | "letterSpacing.tight" | "letterSpacing.normal" | "letterSpacing.wide" | "letterSpacing.wider" | "letterSpacing.widest" | "lead.none" | "lead.tight" | "lead.snug" | "lead.normal" | "lead.relaxed" | "lead.loose" | "radii.2xs" | "radii.xs" | "radii.sm" | "radii.md" | "radii.lg" | "radii.xl" | "radii.xxl" | "radii.full" | "size.4" | "size.6" | "size.8" | "size.12" | "size.16" | "size.20" | "size.24" | "size.32" | "size.40" | "size.48" | "size.56" | "size.64" | "size.80" | "size.104" | "size.200" | "space.0" | "space.1" | "space.2" | "space.4" | "space.6" | "space.8" | "space.10" | "space.12" | "space.16" | "space.20" | "space.24" | "space.32" | "space.40" | "space.44" | "space.48" | "space.56" | "space.64" | "space.80" | "space.104" | "space.140" | "space.200" | "borderWidth.noBorder" | "borderWidth.sm" | "borderWidth.md" | "borderWidth.lg" | "opacity.noOpacity" | "opacity.bright" | "opacity.light" | "opacity.soft" | "opacity.medium" | "opacity.high" | "opacity.total" | "zIndex.0" | "zIndex.1" | "zIndex.2" | "zIndex.4" | "zIndex.6" | "zIndex.8" | "zIndex.10" | "zIndex.12" | "zIndex.16" | "zIndex.20" | "zIndex.24" | "zIndex.32" | "zIndex.40" | "zIndex.44" | "zIndex.48" | "zIndex.56" | "zIndex.64" | "zIndex.80" | "zIndex.104" | "zIndex.140" | "zIndex.200";

export default theme