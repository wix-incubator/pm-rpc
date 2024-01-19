import get from 'lodash/get'
import * as appsRegistrar from './privates/appsRegistrar'
import Intents from './privates/Intents'
import {buildApiFromDescription, getDescription, invokeApiFunction} from './privates/apiManager'
import {send, sendResponse} from './privates/messageManager'
import * as messageHandler from './privates/messageHandler'
import {serialize as serializeError} from './privates/errorSerializer'
import {getTargetInfoFromDef} from './privates/getTargetInfoFromDef'

const onMessage = event => {
  const {data: {appId, intent, call, args, __port: port}} = event
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
      let onApiCallResult
      if (appData.onApiCall) {
        onApiCallResult = appData.onApiCall({appId, call, args})
      }
      const func = get(appData.app, call)
      return invokeApiFunction(func, args)
        .then(sendResponse(port, Intents.RESOLVE), sendResponse(port, Intents.REJECT)).then(() => { 
          if (appData.onApiSettled) {
            appData.onApiSettled({appId, call, args, onApiCallResult})
          }
        })
  }
  return Promise.resolve()
}

export const set = (appId, app, {onApiCall, onApiSettled, workers} = {}, workersDeprecated) => {
  if (workersDeprecated) {
    workers = workersDeprecated
  }
  if (appsRegistrar.hasApp(appId)) {
    appsRegistrar.unregisterApp(appId)
  }
  appsRegistrar.registerApp(appId, app, onApiCall, onApiSettled)
  messageHandler.addSingleHandler(onMessage, workers)
}

export const request = (appId, targetDef = {}) => {
  messageHandler.addSingleHandler(onMessage)

  const targetInfo = getTargetInfoFromDef(targetDef)
  return send({intent: Intents.REQUEST_API, appId}, targetInfo)
    .then(description => description ?
      buildApiFromDescription(appId, description, targetInfo) :
      Promise.reject(new Error(`App with ID ${appId} not found`)))
}

export const unset = appId => {
  appsRegistrar.unregisterApp(appId)
  messageHandler.removeSingleHandler(onMessage)
}
