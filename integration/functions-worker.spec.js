import * as pmrpc from '../src/pm-rpc/index'

describe('passing functions worker', () => {
  let worker
  it('should be able to pass functions as arguments', async () => {
    worker = new Worker('/base/integration/content/functions-worker/worker.js')
    const api = await pmrpc.api.request('worker-functions', {target: worker})
    function add(a, b) {
      return a + b
    }
    expect(await api.reduce(add, 0, [1, 2, 3, 4, 5])).toBe(15)
  })
  afterAll(() => worker.terminate())
})