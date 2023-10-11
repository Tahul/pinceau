export default $styled.button<{ fontSize: string; backgroundColor: string }>({
  fontSize: ({ fontSize }) => fontSize,
  backgroundColor: ({ backgroundColor }) => backgroundColor,
})
