import {parentPort} from 'worker_threads'
export const getTargetInfoFromDef = ({target}) => {
    if (target) {
        return {target}
    } 
    
    return {target: parentPort}
}