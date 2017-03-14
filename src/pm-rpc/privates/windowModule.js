const isWorker = () => typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope
const getChildFrameById = id => document.getElementById(id)
export {
    isWorker,
    getChildFrameById
}