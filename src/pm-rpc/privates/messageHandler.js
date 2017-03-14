
let isListening = false
export const addSingleHandler = handler => {
  if (!isListening) {
    isListening = true
    self.addEventListener('message', handler)
  }
}

export const removeSingleHandler = handler => {
  self.removeEventListener('message', handler)
  isListening = false
}