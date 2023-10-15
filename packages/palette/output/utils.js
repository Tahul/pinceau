export const my = (value) => {
      return {
        marginTop: value,
        marginBottom: value
      };
    }

export const mx = (value) => {
      return {
        marginLeft: value,
        marginRight: value
      };
    }

export const py = (value) => {
      return {
        paddingTop: value,
        paddingBottom: value
      };
    }

export const px = (value) => {
      return {
        paddingLeft: value,
        paddingRight: value
      };
    }

export const truncate = () => ({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    })

export const lineClamp = (lines) => ({
      'overflow': 'hidden',
      'display': '-webkit-box',
      '-webkit-box-orient': 'vertical',
      '-webkit-line-clamp': lines
    })

export const text = (size) => ({
      fontSize: `$text.${size}.fontSize`,
      lineHeight: `$text.${size}.lineHeight`
    })

export const gradientText = (gradient) => ({
      '-webkit-text-fill-color': 'transparent',
      'backgroundImage': gradient,
      '-webkit-background-clip': 'text',
      'backgroundClip': 'text'
    })

export const utils = { my, mx, py, px, truncate, lineClamp, text, gradientText }

export default utils