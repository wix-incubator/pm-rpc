import get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
const _apps = {}

export const registerApp = (id, app, onApiCall) => {
  _apps[id] = {app, onApiCall}
}

export const getAppById = id => get(_apps, [id, 'app'])

export const getAppData = id => _apps[id]

export const hasApp = id => Boolean(_apps[id])

export const unregisterApp = id => delete _apps[id]

export const isEmpty = () => _isEmpty(_apps)