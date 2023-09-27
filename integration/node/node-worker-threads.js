const path = require('path')
const pmrpc = require('../../')
const {Worker} = require('worker_threads')

process.exitCode = 1

const random = Math.random()
const worker = new Worker(path.resolve(__dirname, './worker.js'))

worker.on('error', err => {
    console.log('worker error', err)
    throw err
})
pmrpc.api.set('api-from-main', {
    exampleFromMain: () => `example from main ${random}`,
    someStringVal: 'STRING_VAL',
    someIntVal: 5,
    someBoolVal: true,
    someNullVal: null,
    someUndefinedVal: undefined
}, {workers: [worker]})

let workerApi
pmrpc.api.request('api-from-worker', {target: worker})
    .then(api => {
        workerApi = api
    })
    .then(() => workerApi.example('arg-from-main').then(result => {
        if (result === `worker#example was called witharg-from-main; value from main: example from main ${random}, string val: STRING_VAL, int val: 5, bool val: true, null val: null, undefined val: undefined`) {
            console.log('test passed')
            process.exitCode = 0
        } else {
            console.log('test failed, result:', result)
        }
    }))
    .finally(() => worker.terminate())
    .then(() => {
        pmrpc.api.unset()
        console.log('after unset')
    })
