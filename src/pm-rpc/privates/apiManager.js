import Intents from './Intents'
import {send} from './messageManager'
import _get from 'lodash/get'
import set from 'lodash/set'
import isFunction from 'lodash/isFunction'
import * as argumentsSerializer from './argumentsSerializer'
import {serialize as serializeError} from './errorSerializer'
import handleFunctionResult from './handleFunctionResult'

const DUMMY = true

const get = (obj, path) => path.length === 0 ? obj : _get(obj, path)

const getRemoteCaller = (appId, targetInfo, call) => (...callArgs) => {
  const {args, transfer} = argumentsSerializer.serialize(callArgs)
  return send({appId, call, args, intent: Intents.INVOKE_FUNCTION}, targetInfo, transfer)
    .then(handleFunctionResult)
}

export const buildApiFromDescription = (appId, description, targetInfo) => Object.keys(description)
    .sort()
    .reduce((result, path) =>
        set(result, path, getRemoteCaller(appId, targetInfo, path)),
      {})


function getFunctionInExactPath(val, path) {
  return isFunction(val) ? {[path.join('.')]: DUMMY} : {}
}

const getFunctionsInPath = (path, obj) => {
  const val = get(obj, path)
  const deepFunctions = Object.keys(val)
    .reduce((res, key) => Object.assign(res, getFunctionsInPath([...path, key], obj)), {})
  return Object.assign(getFunctionInExactPath(val, path), deepFunctions)
}

export const getDescription = app => getFunctionsInPath([], app)

export const invokeApiFunction = (func, args) => {
  try {
    const actualArgs = argumentsSerializer.deserialize(args)
    return Promise.resolve(func(...actualArgs))
      .catch(serializeError)
  } catch (e) {
    return serializeError(e)
  }
}