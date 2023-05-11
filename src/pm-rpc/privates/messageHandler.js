import isFunction from 'lodash/isFunction'

let isListening = false

const registerListener = (obj, handler) => {
  if (isFunction(obj.addEventListener)) {
    obj.addEventListener('message', handler)
  } else {
    obj.onmessage = handler
  }
}

export const addSingleHandler = (handler, workers) => {
  console.log('amit: addSingleHandler')
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
  self.removeEventListener('message', handler)
  isListening = false
}