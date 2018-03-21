import * as pmrpc from '../../../src/pm-rpc/index'
pmrpc.api.request('two-iframe-clients', {target: parent})
  .then(api => api.resolve(0))