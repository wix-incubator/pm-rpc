import * as pmrpc from '../src/pm-rpc/index'
xdescribe('two iframes with different names', () => {
  let frames
  it('should be able to set an API with multiple clients', async () => {
    const resolvers = []
    pmrpc.api.set('two-iframe-clients', {
      resolve(x) {
        resolvers[x](x)
      }
    })

    frames = [0, 1].map(index => {
      const iframe = document.createElement('iframe')
      iframe.src = `/base/integration/content/two-iframe-clients/client-frame-${index}.html`
      iframe.name = `iframe-name-${index}`
      return iframe
    })
    const framesSuccessPromises = frames.map((x, i) => new Promise(resolve => {resolvers[i] = resolve}))

    frames.forEach(frame => {document.body.appendChild(frame)})
    expect(await Promise.all(framesSuccessPromises)).toEqual([0, 1])
  })

  afterAll(() => {
    delete window.success
    frames.forEach(frame => document.body.removeChild(frame))
    pmrpc.api.unset('two-iframe-clients')
  })
})