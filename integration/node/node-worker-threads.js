const path = require('path')
const pmrpc = require('../../build/pm-rpc')
const {Worker} = require('worker_threads')

process.exitCode = 1

const random = Math.random()
const worker = new Worker(path.resolve(__dirname, './worker.js'))

pmrpc.api.set('api-from-main', {
    exampleFromMain: () => 'example from main' + random
}, { workers: [worker]})

let workerApi
pmrpc.api.request('api-from-worker', {target: worker})
    .then(api => {
        console.log('api from worker', api)
        workerApi = api
    })
    .then(() => {
        return workerApi.example('arg-from-main').then(result => {
            if (result === 'worker#example was called witharg-from-main; value from main: example from main' + random) {
                console.log('test passed')
                process.exitCode = 0
            }
        })
    })
    .finally(() => {
        return worker.terminate()
    })
    .then(() => {
        pmrpc.api.unset()
        console.log('after unset')
    })
