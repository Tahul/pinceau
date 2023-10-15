const MyButton = $styled.button<{ color: string }>({
  '--button-primary': ({ color }) => `$color.${color}.6`,
  '--button-secondary': ({ color }) => `$color.${color}.5`,
  'display': 'inline-block',
  'borderRadius': '$radii.xl',
  'transition': '$transition.all',
  'color': '$color.white',
  'boxShadow': '0 5px 0 $button.primary, 0 12px 16px $color.dimmed',
  'span': {
    display: 'inline-block',
    fontFamily: '$font.secondary',
    borderRadius: '$radii.lg',
    fontSize: '$fontSize.xl',
    lineHeight: '$lead.none',
    transition: '$transition.all',
    backgroundColor: '$button.primary',
    boxShadow: 'inset 0 -1px 1px $color.dark',
  },
  '&:hover': {
    span: {
      backgroundColor: '$button.secondary',
    },
  },
  '&:active': {
    span: {
      transform: 'translateY($space.4)',
    },
  },
}).withVariants({
  size: {
    sm: {
      span: {
        padding: '$space.6 $space.12',
      },
    },
    md: {
      span: {
        padding: '$space.12 $space.16',
      },
    },
    lg: {
      span: {
        padding: '$space.16 $space.24',
      },
    },
    xl: {
      span: {
        padding: '$space.32 $space.48',
      },
    },
    options: {
      default: 'sm',
    },
  },
})

export default MyButton
