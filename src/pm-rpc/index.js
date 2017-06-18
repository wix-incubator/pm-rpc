import * as api from './rpc'
import es6Promise from 'es6-promise'
import arrayFrom from 'array-from'

if (!Array.from) {
    Array.from = arrayFrom
}
es6Promise.polyfill()

export {
    api
}
