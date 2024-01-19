import get from 'lodash/get'
const _apps = {}

export const registerApp = (id, app, onApiCall, onApiSettled) => {
  _apps[id] = {app, onApiCall, onApiSettled}
}

export const getAppById = id => get(_apps, [id, 'app'])

export const getAppData = id => _apps[id]

export const hasApp = id => Boolean(_apps[id])

export const unregisterApp = id => delete _apps[id]

export const isEmpty = () => Object.keys(_apps).length === 0