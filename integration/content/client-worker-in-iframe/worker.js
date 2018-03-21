import * as pmrpc from '../../../src/pm-rpc/index'

const appIds = ['first', 'second']

appIds.forEach(appId => {
  pmrpc.api.request(appId)
    .then(api => api.resolve(appId))
})