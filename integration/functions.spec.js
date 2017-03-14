import * as pmrpc from '../src/pm-rpc/index'
describe('passing functions', () => {
  let iframe
  it('should be able to pass functions as arguments', done => {
    iframe = document.createElement('iframe')
    iframe.src = '/base/integration/content/functions/single-frame.html'
    document.body.appendChild(iframe)
    iframe.addEventListener('load', () => {
      pmrpc.api.request('functions', {target: iframe.contentWindow})
        .then(api => {
          const filterOdd = arr => arr.filter(x => x % 2)
          const getNumbers = () => fetch('/base/integration/content/functions/numbers.json').then(res => res.json())

          api.maxOdd(getNumbers, filterOdd)
            .then(res => {
              expect(res).toBe(5)
            })
            .then(done, done.fail)
        }, done.fail)
    })
  })
  afterAll(() => document.body.removeChild(iframe))
})