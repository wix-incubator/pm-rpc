import Intents from './Intents'
import {deserialize as deserializeError} from './errorSerializer'

export default ({intent, result}) => {
  switch (intent) {
    case Intents.RESOLVE:
      return result
    case Intents.REJECT:
      return Promise.reject(deserializeError(result))
    default:
      return Promise.reject()
  }
}