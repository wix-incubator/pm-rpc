import {isWorker} from './windowModule'
import cloneDeep from 'lodash/cloneDeep'

// eslint-disable-next-line no-undef, lodash/prefer-lodash-typecheck, no-use-before-define
const Worker = typeof globalThis.Worker !== 'undefined' ? globalThis.Worker : require('worker_threads').Worker
// eslint-disable-next-line no-undef, lodash/prefer-lodash-typecheck, no-use-before-define
const MessagePort = typeof globalThis.MessagePort !== 'undefined' ? globalThis.MessagePort : require('worker_threads').MessagePort
// eslint-disable-next-line no-undef, lodash/prefer-lodash-typecheck, no-use-before-define
const MessageChannel = typeof globalThis.MessageChannel !== 'undefined' ? globalThis.MessageChannel : require('worker_threads').MessageChannel

function postMessage(target, message, targetOrigin, transfer) {
  if (isWorker() || target instanceof Worker || target instanceof MessagePort) {
    try {
      target.postMessage(message, transfer)
    } catch (e) {
    // eslint-disable-next-line no-debugger
      debugger
      throw e
    }
  } else {
    target.postMessage(message, targetOrigin, transfer)
  }
}

export const send = (message, {target, targetOrigin}, transfer = []) => new Promise(resolve => {
  const {port1, port2} = new MessageChannel()
  const handler = ({data}) => {
    resolve(data)
    if (isWorker()) {
      port1.onmessage = null
    } else {
      port1.removeEventListener('message', handler)
    }
    port1.close()
    port2.close()
  }
  if (isWorker()) {
    port1.onmessage = handler
  } else {
    port1.addEventListener('message', handler)
  }
  message.__port = port2

  try {
    postMessage(target, message, targetOrigin, [port2, ...transfer])
  } catch (e) {
    /*
      There's (as of July 2021) no "nice" API to check whether value can be passed through `MessagePort`,
      (i.e. can be "structure cloned"), so we do it by `try/catch`ing the failed `postMessage` calls

      > Why do we need to check it in a first place?

      Because something might try to propagate an event with a `Proxy` object in its payload,
      and those can't be `postMessage`d and can't be reliably detected (there's no (recurvise) `Proxy.isProxy`)

      see also:
      - https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
      - https://dassur.ma/things/deep-copy/
      - https://wix.slack.com/archives/CQGJP31CM/p1623225837185800
    */

    if (e && e.name === 'DataCloneError') {
      const clonedMessage = cloneDeep(message)
      /**
       * This part is needed as lodash.cloneDeep on array doesnt clone additional object properties 
       * For example -  
       * const arr = [1,2,3]
       * arr.port = 5 
       * const b = cloneDeep(arr)
       * arr.port === undefined.
       */
      clonedMessage.__port = port2
      postMessage(target, clonedMessage, targetOrigin, [port2, ...transfer])
    } else {
      throw e
    }
  }
})

export const sendResponse = (port, intent) => result => port.postMessage({intent, result})
