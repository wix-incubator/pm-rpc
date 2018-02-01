import {isWorker} from './windowModule'

export const send = (message, {target, targetOrigin}, transfer = []) => new Promise(resolve => {
  const {port1, port2} = new MessageChannel()
  message.__port = port2
  if (isWorker() || target instanceof Worker || target instanceof MessagePort) {
    target.postMessage(message, [port2, ...transfer])
  } else {
    target.postMessage(message, targetOrigin, [port2, ...transfer])
  }
  port1.onmessage = ({data}) => resolve(data)
})

export const sendResponse = (port, intent) => result => port.postMessage({intent, result})