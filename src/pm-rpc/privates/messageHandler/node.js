import workerThreads from 'worker_threads'
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
    const handlerWrapper = handlerWrapperByHandler.get(handler) || (data => handler({data}))
    obj.on('message', handlerWrapper)
    handlerWrapperByHandler.set(handler, handlerWrapper)
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
      const handlerWrapper = handlerWrapperByHandler.get(handler)
      if (handlerWrapper) {
        obj.off('message', handlerWrapper)
      }
  })
  objsByEventListenerHandler.delete(handler)

  isListening = false
}