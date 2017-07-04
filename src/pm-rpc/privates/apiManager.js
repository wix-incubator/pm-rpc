import Intents from './Intents'
import {send} from './messageManager'
import reduce from 'lodash/reduce'
import assign from 'lodash/assign'
import get from 'lodash/get'
import set from 'lodash/set'
import isFunction from 'lodash/isFunction'
import * as argumentsSerializer from './argumentsSerializer'
import {serialize as serializeError} from './errorSerializer'
import handleFunctionResult from './handleFunctionResult'

const DUMMY = true

const getRemoteCaller = (appId, targetInfo, call) => (...callArgs) => {
  const {args, transfer} = argumentsSerializer.serialize(callArgs)
  return send({appId, call, args, intent: Intents.INVOKE_FUNCTION}, targetInfo, transfer)
      .then(handleFunctionResult)
}

export const buildApiFromDescription = (appId, description, targetInfo) => reduce(
  Object.keys(description).sort(),
  (result, path) => set(result, path, getRemoteCaller(appId, targetInfo, path)),
  {})


function getFunctionInExactPath(val, path) {
  return isFunction(val) ? {[path.join('.')]: DUMMY} : {}
}

const getFunctionsInPath = (path, obj) => {
  const val = get(obj, path)
  return reduce(val, (res, innerVal, key) => assign(res, getFunctionsInPath(path.concat([key]), obj)), getFunctionInExactPath(val, path))
}

export const getDescription = app => reduce(app, (res, val, key) => assign(res, getFunctionsInPath([key], app)), {})

export const invokeApiFunction = (func, args, ports) => {
  try {
    const actualArgs = argumentsSerializer.deserialize(args, ports)
    return Promise.resolve(func(...actualArgs))
      .catch(serializeError)
  } catch (e) {
    return serializeError(e)
  }
}