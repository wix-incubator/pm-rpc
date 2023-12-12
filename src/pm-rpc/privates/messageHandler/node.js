import workerThreads from 'worker_threads'
import isFunction from 'lodash/isFunction'
let isListening = false

const objsByEventListenerHandler = new WeakMap()
const handlerWrapperByHandler = new WeakMap()

const registerListener = (obj, handler) => {
  if (!obj) {
    return
  }

  const objsForHandler = objsByEventListenerHandler.get(handler) || []
  objsForHandler.push(obj)
  objsByEventListenerHandler.set(handler, objsForHandler)

  if (isFunction(obj.on)) {
    const handlerWrapper = handlerWrapperByHandler.get(handler) || (data => handler({data}))
    obj.on('message', handlerWrapper)
    handlerWrapperByHandler.set(handler, handlerWrapper)
  } else if (isFunction(obj.addEventListener)) {
    obj.addEventListener('message', handler)
  } else {
    throw new Error('Object does not have a method to register a message handler')
  }
}

export const addSingleHandler = (handler, workers) => {
  if (!isListening) {
    isListening = true
    // todo: consider having this subscription long-living (now we subscribe on the first `set`/`request` and unsubscribe on the last `unset`
    if (!workerThreads.isMainThread) {
      registerListener(workerThreads.parentPort, handler)
    } else {
      const {port1, port2} = new MessageChannel()
      registerListener(port1, handler)
      registerListener(port2, handler)
    }
  }

  if (workers) {
    workers.forEach(worker => registerListener(worker, handler))
  }
}

export const removeSingleHandler = handler => {
  const objs = objsByEventListenerHandler.get(handler) || []
  objs.forEach(obj => {
    if (isFunction(obj.off)) {
      const handlerWrapper = handlerWrapperByHandler.get(handler)
      if (handlerWrapper) {
        obj.off('message', handlerWrapper)
      }
    } else if (isFunction(obj.removeEventListener)) {
      obj.removeEventListener('message', handler)
    }
  })
  objsByEventListenerHandler.delete(handler)

  isListening = false
}