import * as pmrpc from '../../../src/pm-rpc/index.js'
pmrpc.api.set('worker-app', {
  isWorker() {return true}
})