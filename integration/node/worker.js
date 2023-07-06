const {parentPort} = require('worker_threads')
const pmrpc = require('../../build/pm-rpc')

pmrpc.api.set('api-from-worker', {
    example: (arg) => {
        return pmrpc.api.request('api-from-main', {target: parentPort})
            .then(async api => {
                return api.exampleFromMain()
            })
            .then(valueFromMain => {
                return 'worker#example was called with' + arg + '; value from main: ' + valueFromMain
            })
    }
})
