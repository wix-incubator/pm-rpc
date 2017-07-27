import * as pmrpc from '../src/pm-rpc/index'

describe('passing functions', () => {
  let worker
  it('should be able to pass functions as arguments', done => {
    worker = new Worker('/base/integration/content/functions-worker/worker.js')
    pmrpc.api.request('worker-functions', {target: worker})
      .then(api => {
        function add(a, b) {
          return a + b;
        }
        api.reduce(add, 0, [1, 2, 3, 4, 5])
          .then(res => {
            expect(res).toBe(15)
          })
          .then(done, done.fail)
      }, done.fail)
  })
  afterAll(() => worker.terminate())
})