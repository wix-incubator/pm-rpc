import workerThreads from 'worker_threads'

export const registerNodeListener = (registerListener, handler) => {
    if (!workerThreads.isMainThread) {
        registerListener(workerThreads.parentPort, handler)
    } else {
        const {port1, port2} = new workerThreads.MessageChannel()
        registerListener(port1, handler)
        registerListener(port2, handler)
    }
}