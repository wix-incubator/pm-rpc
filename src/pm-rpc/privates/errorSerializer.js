import get from 'lodash/get'
import isError from 'lodash/isError'

const isErrorType = ({type} = {}) => type === 'Error' || isError(get(self, [type, 'prototype']))
const toError = ({type, stack, message}) => {
    const err = new (self[type] || Error)(message)
    err.stack = stack
    return err
}

const toErrorInfo = ({constructor: {name: type}, message, stack}) => ({type, message, stack})
export const serialize = err => Promise.reject(isError(err) ? toErrorInfo(err) : err)
export const deserialize = err => isErrorType(err) ? toError(err) : err