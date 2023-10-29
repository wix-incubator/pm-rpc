let isListening = false

export const addSingleHandler = (handler, workers) => {
    if (!isListening) {
        isListening = true
        // todo: consider having this subscription long-living (now we subscribe on the first `set`/`request` and unsubscribe on the last `unset`
        self.addEventListener('message', handler)
    }

    if (workers) {
        workers.forEach(worker => worker.addEventListener('message', handler))
    }
}

export const removeSingleHandler = handler => {
    self.removeEventListener('message', handler)
    isListening = false
}