const isWebWorker = () => typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope
const isBrowser = () => typeof window !== 'undefined'
const getChildFrameById = id => document.getElementById(id)
export {
    isWebWorker,
    isBrowser,
    getChildFrameById
}