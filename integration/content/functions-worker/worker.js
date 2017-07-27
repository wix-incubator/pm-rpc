import * as pmrpc from '../../../src/pm-rpc/index'
const api = {
  reduce(fn, initial, arr) {
    return arr.reduce(function (p, i) {
      return p.then(function (acc) {
        return fn(acc, i)
      })
    }, Promise.resolve(initial))
  }
}
pmrpc.api.set('worker-functions', api)