import * as pmrpc from '../../../src/pm-rpc/index'
const api = {
  reduce(fn, initial, arr) {
    return arr.reduce( (p, i) => p.then(acc => fn(acc, i)
      ), Promise.resolve(initial))
  }
}
pmrpc.api.set('worker-functions', api)