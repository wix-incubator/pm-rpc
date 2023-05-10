import isFunction from 'lodash/isFunction'

let isListening = false
export const addSingleHandler = (handler, workers) => {
  if (!isListening) {
    isListening = true
    // todo: consider having this subscription long-living (now we subscribe on the first `set`/`request` and unsubscribe on the last `unset`
    if (isFunction(self.addEventListener)) {
      self.addEventListener('message', handler)
    } else {
      self.onmessage = handler
    }
  }

  if (workers) {
      workers.forEach(worker => {
        if (isFunction(worker.addEventListener)) {
          worker.addEventListener('message', handler)
        } else {
          worker.onmessage = handler
        }
      })
  }
}

export const removeSingleHandler = handler => {
  self.removeEventListener('message', handler)
  isListening = false
}