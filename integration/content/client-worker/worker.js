import * as pmrpc from '../../../src/pm-rpc/index'

onmessage = function (event) {
    if (event.data.message === 'init') {
        pmrpc.api.request('api-for-worker')
            .then(api => {
                if (api.add) {
                    api.add(2, 3)
                    .then(result => {
                        postMessage({message: 'api received', result})
                    }).catch(e => {
                        postMessage({message: 'broken api', result: e})
                    })
                } else {
                    postMessage({message: 'no expected method on api'})
                }
            })
    }
}
