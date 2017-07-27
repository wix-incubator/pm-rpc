import * as pmrpc from '../src/pm-rpc/index.js'
describe('usage with a web worker inside an iframe', () => {
  let iframe
  function loadIframe() {
    return new Promise(resolve => {
      iframe = document.createElement('iframe')
      iframe.src = '/base/integration/content/api-worker-in-iframe/worker-iframe.html'
      iframe.id = 'worker-frame'
      document.body.appendChild(iframe)
      iframe.addEventListener('load', resolve)
    })
  }

  it('should receive an API from a worker and call it correctly', done => {

    loadIframe()
      .then(() => pmrpc.api.request('worker-app', {initiator: 'worker-frame'}))
      .then(api => api.isWorker())
      .then(result => {
        expect(result).toBe(true)
      })
      .then(done)
  })

  afterAll(() => {
    iframe.worker.terminate()
    document.body.removeChild(iframe)
  })
})