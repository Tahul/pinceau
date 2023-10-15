export default () => {
  console.log('hello world')

  return <div className="test-style">css() style component</div>
}

css({
  '.test-style': {
    fontSize: 32,
  },
})
