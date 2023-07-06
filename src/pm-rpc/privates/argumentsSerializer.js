import isFunction from 'lodash/isFunction'
import {send, sendResponse} from './messageManager'
import Intents from './Intents'
import handleFunctionResult from './handleFunctionResult'

export const serialize = arr => arr.reduce(({args, transfer}, arg) => {
  if (isFunction(arg)) {
    const {port1, port2} = new MessageChannel()
    port1.onmessage = ({data}) => {
      const port = data.__port
      Promise.resolve(arg(...data))
        .then(sendResponse(port, Intents.RESOLVE), sendResponse(port, Intents.REJECT))
        .finally(() => {
          port1.close()
          port2.close()
        })
    }
    const index = transfer.length
    args.push({
      type: 'function',
      index,
      port: port2
    })
    transfer.push(port2)
  } else {
    args.push({
      type: 'value',
      value: arg
    })
  }
  return {args, transfer}
}, {args: [], transfer: []})

export const deserialize = arr => arr.map(arg => {
  if (arg.type === 'value') {
    return arg.value
  }
  return function (...args) {
    const target = arg.port
    return send(args, {target})
      .then(handleFunctionResult)
  }
})