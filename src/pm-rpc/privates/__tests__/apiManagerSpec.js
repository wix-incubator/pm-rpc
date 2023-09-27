import * as apiManager from '../apiManager'
import * as messageManager from '../messageManager'
import _ from 'lodash'
import Intents from '../Intents'
import {serialize as serializeArgs} from '../argumentsSerializer'

describe('apiManager', () => {
  describe('getDescription', () => {
    it('should return an object with the same keys and dummy values', () => {
      const API = {
        f: _.noop,
        g: _.noop
      }
      const description = apiManager.getDescription(API)
      expect(_.size(description)).toBe(_.size(API))
      expect(description.hasOwnProperty('f')).toBe(true)
      expect(description.hasOwnProperty('g')).toBe(true)
    })

    it('should map primitives to an object with primitive: true and value', () => {
      const API = {
        f: 'string',
        g: 5
      }
      const description = apiManager.getDescription(API)
      expect(description.f).toEqual({primitive: true, value: 'string'})
      expect(description.g).toEqual({primitive: true, value: 5})
    })

    it('should work on deep objects', () => {
        const API = {
          ns: {
            f: _.noop
          }
        }
        const description = apiManager.getDescription(API)
        expect(description).toEqual({'ns.f': true})
    })

    it('should work with functions as namespaces', () => {
        const API = {
          add: (a, b) => a + b
        }
        API.add.one = a => 1 + a
        const description = apiManager.getDescription(API)
        expect(description).toEqual({add: true, 'add.one': true})
    })

    it('should return empty object for empty API', () => {
      const API = {}
      const description = apiManager.getDescription(API)
      expect(description).toEqual({})
    })
  })
  describe('buildApiFromDescription', () => {
    const fakeId = 'fake-app'
    const fakeTargetInfo = {}
    it('should create an object with methods with the same keys as the description', () => {
      const description = {f: true, g: true}
      const remoteAPI = apiManager.buildApiFromDescription(fakeId, description, fakeTargetInfo)
      expect(_.size(remoteAPI)).toBe(_.size(description))
      expect(_.every(remoteAPI, _.isFunction)).toBe(true)
      expect(remoteAPI.hasOwnProperty('f')).toBe(true)
      expect(remoteAPI.hasOwnProperty('g')).toBe(true)
    })

    it('should work with deep objects', () => {
        const description = {'ns.f': true}
        const remoteAPI = apiManager.buildApiFromDescription(fakeId, description, fakeTargetInfo)
        expect(remoteAPI.ns).toEqual({f: jasmine.any(Function)})
    })

    it('should work with functions as namespaces', () => {
        const description = {add: true, 'add.one': true}
        const remoteAPI = apiManager.buildApiFromDescription(fakeId, description, fakeTargetInfo)
        expect(_.isFunction(remoteAPI.add)).toBe(true)
        expect(_.isFunction(remoteAPI.add.one)).toBe(true)
    })

    describe('method invocation in built API', () => {
      beforeEach(() => {
        spyOn(messageManager, 'send')
      })

      it('should resolve the promise with the value if it was sent with the RESOLVE intent', done => {
        const resolvedValue = {
          result: {},
          intent: Intents.RESOLVE
        }
        messageManager.send.and.returnValue(Promise.resolve(resolvedValue))
        const remoteAPI = apiManager.buildApiFromDescription(fakeId, {f: true}, fakeTargetInfo)
        remoteAPI.f()
          .then(result => {
            expect(result).toBe(resolvedValue.result)
          })
          .then(done)
      })


      it('should reject the promise with the value if it was sent with the REJECT intent', done => {
        const rejectedValue = {
          result: 'error message',
          intent: Intents.REJECT
        }
        messageManager.send.and.returnValue(Promise.resolve(rejectedValue))
        const remoteAPI = apiManager.buildApiFromDescription(fakeId, {f: true}, fakeTargetInfo)
        remoteAPI.f()
          .catch(result => {
            expect(result).toBe(rejectedValue.result)
          })
          .then(done)
      })
    })
  })
  describe('invokeApiFunction', () => {
    it('should return a promise for a value that is returned immediately', done => {
      const immediate = x => x
      apiManager.invokeApiFunction(immediate, serializeArgs([1]).args)
        .then(result => {
          expect(result).toBe(1)
        })
        .then(done)
    })

    it('should return a promise for the promised value from the function', done => {
      const promised = x => Promise.resolve(x)
      apiManager.invokeApiFunction(promised, serializeArgs([1]).args)
        .then(result => {
          expect(result).toBe(1)
        })
        .then(done)
    })

    it('should return a rejected promise if the function rejects the value', done => {
      const rejected = x => Promise.reject(x)
      apiManager.invokeApiFunction(rejected, serializeArgs([1]).args)
        .catch(result => {
          expect(result).toBe(1)
        })
        .then(done)
    })

    it('should return a rejected string if a string is thrown', done => {
      const throwString = x => {throw x}
      apiManager.invokeApiFunction(throwString, serializeArgs(['error']).args)
        .catch(result => {
          expect(result).toBe('error')
        })
        .then(done)
    })

    it('should return error info about the error if it is thrown', done => {
      const throwError = x => {throw new SyntaxError(x)}
      apiManager.invokeApiFunction(throwError, serializeArgs(['error']).args)
        .catch(result => {
          expect(result).toEqual({type: 'SyntaxError', message: 'error', stack: jasmine.any(String)})
        })
        .then(done)
    })
    it('should revert to a generic error if the Error type is not native', done => {
      class MyError extends Error {}
      const throwMyError = x => {throw new MyError(x)}
      apiManager.invokeApiFunction(throwMyError, serializeArgs(['error']).args)
        .catch(result => {
          expect(result).toEqual({type: 'MyError', message: 'error', stack: jasmine.any(String)})
        })
        .then(done)
    })
  })
})