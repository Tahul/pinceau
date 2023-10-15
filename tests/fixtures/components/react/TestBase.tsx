export default () => {
  const test = 'hello World'

  return <div className="test-base">{test}</div>
}

css({
  '.test-base': {
    fontSize: '16px',
  },
})
