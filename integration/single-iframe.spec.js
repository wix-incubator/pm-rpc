import * as pmrpc from '../src/pm-rpc/index'
describe('single iframe', () => {
  let iframe
  it('should be able to create an iframe and use an API from it', done => {
    iframe = document.createElement('iframe')
    iframe.src = '/base/integration/content/single-iframe/single-frame.html'
    document.body.appendChild(iframe)
    iframe.addEventListener('load', () => {
      pmrpc.api.request('123', {target: iframe.contentWindow})
        .then(api => {
          const name = 'spider pig'
          const testResolve = api.resolveName(name)
            .then(result => {
              expect(result).toBe(name)
            })
          const testReject = api.rejectPromise()
            .catch(err => {
              expect(err).toBe('rejected promise')
            })
          Promise.all([testResolve, testReject])
            .then(() => done())
        }, done.fail)
    })
  })
  afterAll(() => document.body.removeChild(iframe))
})