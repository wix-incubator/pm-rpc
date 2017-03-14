import * as pmrpc from '../../../src/pm-rpc/index'
pmrpc.api.request('two-iframe-clients', {target: parent})
  .then(api => api.identity(1))
  .then(x => parent.success(x))