import isFunction from 'lodash/isFunction'

let isListening = false

const objsByEventListenerHandler = new WeakMap()

const registerListener = (obj, handler) => {
  if (!obj) {
    return
  }

  
  if (isFunction(obj.addEventListener)) {
    const objsForHandler = objsByEventListenerHandler.get(handler) || []
    objsForHandler.push(obj)
    objsByEventListenerHandler.set(handler, objsForHandler)
    obj.addEventListener('message', handler)
  } else if (isFunction(obj.on)) {
    obj.on('message', data => handler({data}))
  }
}

export const addSingleHandler = (handler, workers) => {
  if (!isListening) {
    isListening = true
    // todo: consider having this subscription long-living (now we subscribe on the first `set`/`request` and unsubscribe on the last `unset`
    if (typeof self !== 'undefined') {
      registerListener(self, handler)
    } else if (typeof window !== 'undefined') {
      window.removeEventListener('message', handler)
    } else {
      // eslint-disable-next-line no-undef
      const workerThreads = require('worker_threads')
      if (!workerThreads.isMainThread) {
        registerListener(workerThreads.parentPort, handler)
      } else {
        const {port1, port2} = new workerThreads.MessageChannel()
        registerListener(port1, handler)
        registerListener(port2, handler)
      }
    }
  }
  
  if (workers) {
    workers.forEach(worker => {
      registerListener(worker, handler)
    })
  }
}

export const removeSingleHandler = handler => {
  if (typeof self !== 'undefined') {
    self.removeEventListener('message', handler)
  } else if (typeof window !== 'undefined') {
    window.removeEventListener('message', handler)
  }

  const objs = objsByEventListenerHandler.get(handler) || []
  objs.forEach(obj => {
    obj.removeEventListener('message', handler)
  })
  objsByEventListenerHandler.delete(handler)

  isListening = false
}