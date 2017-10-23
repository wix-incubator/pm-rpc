import * as appsRegistrar from './privates/appsRegistrar'
import {isWorker, getChildFrameById} from './privates/windowModule'
import Intents from './privates/Intents'
import {buildApiFromDescription, getDescription, invokeApiFunction} from './privates/apiManager'
import {send, sendResponse} from './privates/messageManager'
import * as messageHandler from './privates/messageHandler'
import {serialize as serializeError} from './privates/errorSerializer'

const getTargetInfoFromDef = ({target, initiator}) => {
  switch (true) {
    case isWorker():
      return {target: self, targetOrigin: '*'}
    case target === parent:
      return {target: parent, targetOrigin: '*'}
    case target instanceof Worker:
      return {target}
    case Boolean(target):
      if (target.contentWindow) {
        return {target: target.contentWindow, targetOrigin: target.src}
      }
      return {target, targetOrigin: '*'}
    case Boolean(initiator):
      const element = getChildFrameById(initiator)
      return {target: element.contentWindow, targetOrigin: element.src}
    default:
      throw new Error('Invalid target')
  }
}

const onMessage = ({data: {appId, intent, call, args}, ports: messagePorts}) => {
  const [port, ...ports] = messagePorts || []
  switch (intent) {
    case Intents.REQUEST_API:
      const app = appsRegistrar.getAppById(appId)
      const description = app ? getDescription(app) : null
      port.postMessage(description)
      return
    case Intents.INVOKE_FUNCTION:
      const appData = appsRegistrar.getAppData(appId)
      if (!appData) {
        const noApiError = new Error(`The API for ${appId} has been removed`)
        return sendResponse(port, Intents.REJECT)(serializeError(noApiError))
      }
      if (appData.onApiCall) {
        appData.onApiCall({appId, call, args})
      }
      const func = appData.app[call]
      return invokeApiFunction(func, args, ports)
        .then(sendResponse(port, Intents.RESOLVE), sendResponse(port, Intents.REJECT))

  }
}

export const set = (appId, app, {onApiCall} = {}) => {
  if (appsRegistrar.hasApp(appId)) {
    appsRegistrar.unregisterApp(appId)
  }
  appsRegistrar.registerApp(appId, app, onApiCall)
  messageHandler.addSingleHandler(onMessage)

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