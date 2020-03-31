import * as pmrpc from '../src/pm-rpc/index'
import noop from 'lodash/noop'

describe('web worker', () => {
    it('should set API in main thread and request it in worker', done => {
        const workerInstance = new Worker('/base/integration/content/client-worker/worker.js')
        pmrpc.api.set('api-for-worker', {add: (a, b) => a + b}, noop, [workerInstance])
        workerInstance.onmessage = event => {
            if (event.data.message === 'api received') {
                expect(event.data.result).toBe(5)
                workerInstance.terminate()
                pmrpc.api.unset('api-for-worker')
                done()
            }
        }
        workerInstance.postMessage({message: 'init'})
    })
})