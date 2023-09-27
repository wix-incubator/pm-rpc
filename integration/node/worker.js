const pmrpc = require('../../')

pmrpc.api.set('api-from-worker', {
    example: arg => pmrpc.api.request('api-from-main')
        .then(async api => {
            const valueFromMain = await api.exampleFromMain()
            const [
                constVal,
                invVal,
                boolVal,
                nullVal,
                undefinedVal
            ] = [
                api.someStringVal,
                api.someIntVal,
                api.someBoolVal,
                api.someNullVal,
                api.someUndefinedVal
            ]

            return `worker#example was called with${arg}; value from main: ${valueFromMain}, string val: ${constVal}, int val: ${invVal}, bool val: ${boolVal}, null val: ${nullVal}, undefined val: ${undefinedVal}`
        })
})
