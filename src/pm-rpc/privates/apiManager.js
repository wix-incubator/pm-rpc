import Intents from './Intents'
import {send} from './messageManager'
import mapValues from 'lodash/mapValues'
import * as argumentsSerializer from './argumentsSerializer'
import {serialize as serializeError} from './errorSerializer'
import handleFunctionResult from './handleFunctionResult'

const DUMMY = true

const getRemoteCaller = (appId, targetInfo, call) => (...callArgs) => {
  const {args, transfer} = argumentsSerializer.serialize(callArgs)
  return send({appId, call, args, intent: Intents.INVOKE_FUNCTION}, targetInfo, transfer)
      .then(handleFunctionResult)
}

export const buildApiFromDescription = (appId, description, targetInfo) => mapValues(description, (dummy, call) => getRemoteCaller(appId, targetInfo, call))

export const getDescription = app => mapValues(app, () => DUMMY)

export const invokeApiFunction = (func, args, ports) => {
  try {
    const actualArgs = argumentsSerializer.deserialize(args, ports)
    return Promise.resolve(func(...actualArgs))
      .catch(serializeError)
  } catch (e) {
    return serializeError(e)
  }
}