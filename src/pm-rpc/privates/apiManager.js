import Intents from './Intents'
import {send} from './messageManager'
import _get from 'lodash/get'
import set from 'lodash/set'
import isFunction from 'lodash/isFunction'
import isObject from 'lodash/isObject'
import isString from 'lodash/isString'
import isBoolean from 'lodash/isBoolean'
import isNumber from 'lodash/isNumber'
import isUndefined from 'lodash/isUndefined'
import isNull from 'lodash/isNull'
import * as argumentsSerializer from './argumentsSerializer'
import {serialize as serializeError} from './errorSerializer'
import handleFunctionResult from './handleFunctionResult'

const FUNCTION_SYMBOL = true

const get = (obj, path) => path.length === 0 ? obj : _get(obj, path)

const getRemoteCaller = (appId, targetInfo, call) => (...callArgs) => {
  const {args, transfer} = argumentsSerializer.serialize(callArgs)
  return send({appId, call, args, intent: Intents.INVOKE_FUNCTION}, targetInfo, transfer)
    .then(handleFunctionResult)
}

export const buildApiFromDescription = (appId, description, targetInfo) => Object.keys(description)
    .sort()
    .reduce((result, path) => {
      const descriptor = _get(description, path)
      if (descriptor === FUNCTION_SYMBOL) {
        return set(result, path, getRemoteCaller(appId, targetInfo, path))
      } if (descriptor.primitive) {
        return set(result, path, descriptor.value)
      }
      return null
    },
    {})


function getDescriptionInExactPath(val, path) {
  if (isFunction(val)) {
    return {[path.join('.')]: FUNCTION_SYMBOL}
  }

  if (isString(val) || isBoolean(val) || isNumber(val) || isUndefined(val) || isNull(val)) {
    return {[path.join('.')]: {primitive: true, value: val}}
  }

  return {}
}

const getDescriptionInPath = (path, obj) => {
  const val = get(obj, path)
  const deepDescription = 
    isObject(val) ? Object.keys(val).reduce(
      (acc, key) => 
        Object.assign(acc, getDescriptionInPath([...path, key], obj)),
      {}
    ) : {}
  return Object.assign(getDescriptionInExactPath(val, path), deepDescription)
}

export const getDescription = app => getDescriptionInPath([], app)

export const invokeApiFunction = (func, args) => {
  try {
    const actualArgs = argumentsSerializer.deserialize(args)
    return Promise.resolve(func(...actualArgs))
      .catch(serializeError)
  } catch (e) {
    return serializeError(e)
  }
}