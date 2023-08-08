const pmrpc = require('../../')

pmrpc.api.set('api-from-worker', {
    example: arg => pmrpc.api.request('api-from-main')
            .then(async api => api.exampleFromMain())
            .then(valueFromMain => `worker#example was called with${arg}; value from main: ${valueFromMain}`)
})
