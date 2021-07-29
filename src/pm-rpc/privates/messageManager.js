import {isWorker} from './windowModule'
import cloneDeep from 'lodash/cloneDeep'

function postMessage(target, message, targetOrigin, transfer) {
  if (isWorker() || target instanceof Worker || target instanceof MessagePort) {
    target.postMessage(message, transfer)
  } else {
    target.postMessage(message, targetOrigin, transfer)
  }
}

export const send = (message, {target, targetOrigin}, transfer = []) => new Promise(resolve => {
  const {port1, port2} = new MessageChannel()
  port1.onmessage = ({data}) => resolve(data)
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
