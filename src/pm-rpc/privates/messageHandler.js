
let isListening = false
export const addSingleHandler = (handler, workers) => {
  if (!isListening) {
    isListening = true
    self.addEventListener('message', handler)
    if (workers) {
      workers.forEach(worker => worker.addEventListener('message', handler))
    }
  }
}

export const removeSingleHandler = handler => {
  self.removeEventListener('message', handler)
  isListening = false
}