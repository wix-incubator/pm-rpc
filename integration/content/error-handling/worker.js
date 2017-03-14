import * as pmrpc from '../../../src/pm-rpc/index'

class CustomError extends Error {}

pmrpc.api.set('errors', {
  throwSyntaxError(message) {
    throw new SyntaxError(message)
  },
  throwCustomError(message) {
    throw new CustomError(message)
  },
  rejectSyntaxError(message) {
    return Promise.reject(new SyntaxError(message))
  },
  rejectCustomError(message) {
    return Promise.reject(new CustomError(message))
  },
  throwMessage(message) {
    throw message
  },
  rejectMessage(message) {
    return Promise.reject(message)
  }
})