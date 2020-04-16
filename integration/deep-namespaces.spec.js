import * as pmrpc from '../src/pm-rpc/index'
describe('deep namespaces', () => {
  let worker

  beforeAll(() => {
    worker = new Worker('/base/integration/content/deep-namespaces/worker.js')
  })

  it('should be able to run functions from deep namespaces', async () => {
    const api = await pmrpc.api.request('deep-namespaces', {target: worker})
    expect(await api.namespace.f(5)).toBe(5)
  })

  it('should be able to accept functions as namespaces', async () => {
    const api = await pmrpc.api.request('functions-as-namespaces', {target: worker})
    expect(await api.f.g(2)).toBe(2)
  })

  afterAll(() => {
    worker.terminate()
  })
})