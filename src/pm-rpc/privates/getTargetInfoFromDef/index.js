
import {isWebWorker, getChildFrameById} from '../windowModule'

export const getTargetInfoFromDef = ({target, initiator}) => {
    switch (true) {
        // In case of MessagePort is undefined
        case typeof MessagePort !== 'undefined' && target instanceof MessagePort:
            return {target}
        // Worker is undefined in Safari in the code that is executed inside a web worker
        case typeof Worker !== 'undefined' && target instanceof Worker:
            return {target}
        case typeof parent !== 'undefined' && target === parent:
            return {target: parent, targetOrigin: '*'}
        case Boolean(target):
            if (target.contentWindow) { // target.contentWindow can throw error if (frame has no permission) {
                return {target: target.contentWindow, targetOrigin: target.src}
            }
            return {target, targetOrigin: '*'}
        case isWebWorker():
            return {target: self, targetOrigin: '*'}
        case Boolean(initiator):
            const element = getChildFrameById(initiator)
            return {target: element.contentWindow, targetOrigin: element.src}
        default:
            throw new Error('Invalid target')
    }
}