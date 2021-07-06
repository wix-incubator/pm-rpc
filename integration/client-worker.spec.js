import * as pmrpc from '../src/pm-rpc/index'

describe('web worker', () => {
    let workerInstance

    it('should set API in main thread and request it in worker', done => {
        workerInstance = new Worker('/base/integration/content/client-worker/worker.js')
        pmrpc.api.set('api-for-worker', {add: (a, b) => a + b}, {workers: [workerInstance]})

        workerInstance.onmessage = event => {
            switch (event.data.message) {
                case 'api received':
                    expect(event.data.result).toBe(5)
                    done()
                    break
                case 'broken api':
                    done.fail(event.data.result)
                    break
                case 'no expected method on api':
                    done.fail('no expected method on api')
                    break
            }
        }
        workerInstance.postMessage({message: 'init'})
    })

    afterEach(() => {
        workerInstance.terminate()
        pmrpc.api.unset('api-for-worker')
    })
})
