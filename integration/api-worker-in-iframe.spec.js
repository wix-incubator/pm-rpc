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

  it('should receive an API from a worker and call it correctly', async () => {
    await loadIframe()
    const api = await pmrpc.api.request('worker-app', {initiator: 'worker-frame'})
    expect(await api.isWorker()).toBe(true)
  })

  afterAll(() => {
    iframe.contentWindow.worker.terminate()
    document.body.removeChild(iframe)
  })
})