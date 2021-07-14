import get from 'lodash/get'
import * as appsRegistrar from './privates/appsRegistrar'
import {isWorker, getChildFrameById} from './privates/windowModule'
import Intents from './privates/Intents'
import {buildApiFromDescription, getDescription, invokeApiFunction} from './privates/apiManager'
import {send, sendResponse} from './privates/messageManager'
import * as messageHandler from './privates/messageHandler'
import {serialize as serializeError} from './privates/errorSerializer'

const getTargetInfoFromDef = ({target, initiator}) => {
  switch (true) {
    // MessagePort is undefined in Safari in the code that is executed inside a web worker
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
    case isWorker():
      return {target: self, targetOrigin: '*'}
    case Boolean(initiator):
      const element = getChildFrameById(initiator)
      return {target: element.contentWindow, targetOrigin: element.src}
    default:
      throw new Error('Invalid target')
  }
}

const onMessage = ({data: {appId, intent, call, args, __port: port}}) => {
  switch (intent) {
    case Intents.REQUEST_API:
      const app = appsRegistrar.getAppById(appId)
      const description = app ? getDescription(app) : null
      port.postMessage(description)
      return Promise.resolve()
    case Intents.INVOKE_FUNCTION:
      const appData = appsRegistrar.getAppData(appId)
      if (!appData) {
        const noApiError = new Error(`The API for ${appId} has been removed`)
        return sendResponse(port, Intents.REJECT)(serializeError(noApiError))
      }
      if (appData.onApiCall) {
        appData.onApiCall({appId, call, args})
      }
      const func = get(appData.app, call)
      return invokeApiFunction(func, args)
        .then(sendResponse(port, Intents.RESOLVE), sendResponse(port, Intents.REJECT))
  }
  return Promise.resolve()
}

export const set = (appId, app, {onApiCall, workers} = {}, workersDeprecated) => {
  if (workersDeprecated) {
    workers = workersDeprecated
  }
  if (appsRegistrar.hasApp(appId)) {
    appsRegistrar.unregisterApp(appId)
  }
  appsRegistrar.registerApp(appId, app, onApiCall)
  messageHandler.addSingleHandler(onMessage, workers)
}

export const request = (appId, targetDef = {}) => {
  const targetInfo = getTargetInfoFromDef(targetDef)
  return send({intent: Intents.REQUEST_API, appId}, targetInfo)
    .then(description => description ?
      buildApiFromDescription(appId, description, targetInfo) :
      Promise.reject(new Error(`App with ID ${appId} not found`)))
}

export const unset = appId => {
  appsRegistrar.unregisterApp(appId)
  if (appsRegistrar.isEmpty()) {
    messageHandler.removeSingleHandler(onMessage)
  }
}
