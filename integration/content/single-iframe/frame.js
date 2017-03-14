import * as pmrpc from '../../../src/pm-rpc/index'
const api = {
  rejectPromise() {
    return Promise.reject('rejected promise')
  },
  resolveName(name) {
    return Promise.resolve(name)
  }
}
pmrpc.api.set('123', api)