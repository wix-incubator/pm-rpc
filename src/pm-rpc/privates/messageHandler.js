import isFunction from 'lodash/isFunction'

let isListening = false

const handlersForObj = new WeakMap()
const registerHandlerForOnmessage = (obj, handler) => {
  if (!handlersForObj.has(obj)) {
    handlersForObj.set(obj, [])
  }
  handlersForObj.get(obj).push(handler)
}

const registerListener = (obj, handler) => {
  if (isFunction(obj.addEventListener)) {
    obj.addEventListener('message', handler)
  } else {
    if (!handlersForObj.has(obj)) {
      obj.onmessage = e => (handlersForObj.get(obj) || []).forEach(_handler => _handler(e))
    }
    registerHandlerForOnmessage(obj, handler)
  }
}

export const addSingleHandler = (handler, workers) => {
  if (!isListening) {
    isListening = true
    // todo: consider having this subscription long-living (now we subscribe on the first `set`/`request` and unsubscribe on the last `unset`
    registerListener(self, handler)
  }

  if (workers) {
      workers.forEach(worker => {
        registerListener(worker, handler)
      })
  }
}

export const removeSingleHandler = handler => {
  if (isFunction(self.removeEventListener)) {
    self.removeEventListener('message', handler)
  } else {
    const handlers = handlersForObj.get(self)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index !== -1) {
        handlers.splice(index, 1)
      }
    }
  }
  isListening = false
}