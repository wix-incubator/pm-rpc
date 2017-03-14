import * as pmrpc from '../../../src/pm-rpc/index'
const api = {
  maxOdd(getNumbers, getOdd) {
    return getNumbers()
      .then(getOdd)
      .then(odds => Math.max(...odds))
  }
}
pmrpc.api.set('functions', api)