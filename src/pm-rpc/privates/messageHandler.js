import isFunction from 'lodash/isFunction'
import {registerNodeListener} from './nodeListener'
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
  } else {
    obj.onmessage = handler
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
      registerNodeListener(registerListener, handler)
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
