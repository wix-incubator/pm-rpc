import isFunction from 'lodash/isFunction'
import transform from 'lodash/transform'
import map from 'lodash/map'
import {send, sendResponse} from './messageManager'
import Intents from './Intents'
import handleFunctionResult from './handleFunctionResult'

export const serialize = arr => transform(arr, ({args, transfer}, arg) => {
  if (isFunction(arg)) {
    const {port1, port2} = new MessageChannel()
    port1.onmessage = ({data, ports: [transferPort]}) => {
      const port = data.__port || transferPort
      Promise.resolve(arg(...data))
        .then(sendResponse(port, Intents.RESOLVE), sendResponse(port, Intents.REJECT))
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
}, {args: [], transfer: []})

export const deserialize = (arr, ports) => map(arr, arg => {
  switch (arg.type) {
    case 'value':
      return arg.value
    case 'function':
      return function(...args) {
        const target = arg.port || ports[arg.index]
        return send(args, {target})
          .then(handleFunctionResult)
      }
  }

})