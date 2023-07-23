const {parentPort} = require('worker_threads')
const pmrpc = require('../../build/pm-rpc')

pmrpc.api.set('api-from-worker', {
    example: arg => pmrpc.api.request('api-from-main', {target: parentPort})
            .then(async api => api.exampleFromMain())
            .then(valueFromMain => `worker#example was called with${arg}; value from main: ${valueFromMain}`)
})
