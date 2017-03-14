import * as pmrpc from '../src/pm-rpc/index'
describe('two iframes with different names', () => {
  let frames
  it('should be able to create an iframe and use an API from it', done => {
    const resolvers = []
    window.success = x => {
      resolvers[x]()
    }
    pmrpc.api.set('two-iframe-clients', {
      identity(x) {return x}
    })

    frames = [0, 1].map(index => {
      const iframe = document.createElement('iframe')
      iframe.src = `/base/integration/content/two-iframe-clients/client-frame-${index}.html`
      iframe.name = `iframe-name-${index}`
      return iframe
    })
    const framesSuccessPromises = frames.map((x, i) => new Promise(resolve => {resolvers[i] = resolve}))

    frames.forEach(frame => {document.body.appendChild(frame)})

    Promise.all(framesSuccessPromises)
      .then(() => {delete window.success})
      .then(done)
  })

  afterAll(() => {
    frames.forEach(frame => document.body.removeChild(frame))
    pmrpc.api.unset('two-iframe-clients')
  })
})