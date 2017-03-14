import * as pmrpc from '../src/pm-rpc/index'
describe('web worker inside an iframe', () => {
  let iframe
  beforeAll(done => {
    iframe = document.createElement('iframe')
    iframe.src = '/base/integration/content/client-worker-in-iframe/worker-iframe.html'
    document.body.appendChild(iframe)
    iframe.addEventListener('load', () => done())
  })

  it('should send multiple APIs to a worker inside an iframe correctly', done => {
    const resolvers = []
    const apiSuccessPromises = [0, 1].map(i => new Promise(resolve => {resolvers[i] = resolve}))

    window.finished = version => {
      resolvers[version - 1](version)
    }

    const firstAPI = {version() {return 1}}
    const secondAPI = {version() {return 2}}
    pmrpc.api.set('first', firstAPI)
    pmrpc.api.set('second', secondAPI)

    Promise.all(apiSuccessPromises)
      .then(result => {
        expect(result).toEqual([1, 2])
      })
      .then(done)
  })
  afterAll(() => {
    document.body.removeChild(iframe)
    pmrpc.api.unset('first')
    pmrpc.api.unset('second')
  })
})