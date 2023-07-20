import * as rpc from '../rpc'
import * as appsRegistrar from '../privates/appsRegistrar'
import * as windowModule from '../privates/windowModule'
import * as messageManager from '../privates/messageManager'
import {serialize as serializeArgs} from '../privates/argumentsSerializer'
import Intents from '../privates/Intents'
import * as messageHandler from '../privates/messageHandler'

const fakeId_2 = 'someID_2'
const fakeAPI_2 = {
  identity: x => x
}
class MockWebWorker {
  constructor(stringUrl) {
    this.url = stringUrl
    this.addEventListener = jasmine.createSpy('workerAddEventListener')
  }
}
global.Worker = MockWebWorker //eslint-disable-line

describe('rpc', () => {
  beforeEach(() => {
    messageHandler.removeSingleHandler()
  }) 

  describe('set API', () => {
    beforeEach(() => {
      spyOn(self, 'addEventListener')
      spyOn(appsRegistrar, 'registerApp')
      spyOn(appsRegistrar, 'unregisterApp')
      spyOn(messageHandler, 'addSingleHandler').and.callThrough()
    })

    const fakeId = 'someID'
    const fakeAPI = {
      identity: x => x
    }

    it('should set the API in the appsRegistrar and wait for requests if there is no app with the ID', () => {
      rpc.set(fakeId, fakeAPI)
      expect(appsRegistrar.registerApp).toHaveBeenCalledWith(fakeId, fakeAPI, undefined)
      expect(messageHandler.addSingleHandler).toHaveBeenCalledWith(jasmine.any(Function), undefined)
    })

    it('should set an onApiCall listener if it was passed', () => {
      const onApiCall = jasmine.createSpy('onApiCall')
      rpc.set(fakeId, fakeAPI, {onApiCall})
      expect(appsRegistrar.registerApp).toHaveBeenCalledWith(fakeId, fakeAPI, onApiCall)
    })

    it('should unregister and register new API', () => {
        const onApiCall = jasmine.createSpy('onApiCall')
      spyOn(appsRegistrar, 'hasApp').and.returnValue(true)
      rpc.set(fakeId, fakeAPI, {onApiCall})
        expect(appsRegistrar.unregisterApp).toHaveBeenCalledWith(fakeId)
      expect(appsRegistrar.registerApp).toHaveBeenCalledWith(fakeId, fakeAPI, onApiCall)
      expect(messageHandler.addSingleHandler).toHaveBeenCalledWith(jasmine.any(Function), undefined)
    })

    describe('messageHandler', () => {
      it('should call to self.addEventListener', () => {
        rpc.set(fakeId, fakeAPI)
        expect(self.addEventListener).toHaveBeenCalledTimes(1)
      })

      it('should NOT call to self.addEventListener if there is already defined listener ', () => {
        rpc.set(fakeId, fakeAPI)
        rpc.set(fakeId_2, fakeAPI_2)
        expect(self.addEventListener).toHaveBeenCalledTimes(1)
      })

      it('should add event listener on each given worker', () => {
        const worker_1 = new Worker('someUrl')
        const worker_2 = new Worker('someUrl')

        rpc.set(fakeId, fakeAPI, {workers: [worker_1, worker_2]})

        expect(worker_1.addEventListener).toHaveBeenCalledTimes(1)
        expect(worker_2.addEventListener).toHaveBeenCalledTimes(1)
      })

      it('should call to add event listener on each given worker on each rpc set', () => {
        const worker_1 = new Worker('someUrl')
        const worker_2 = new Worker('someUrl')
        const worker_3 = new Worker('someUrl')

        rpc.set(fakeId, fakeAPI, {workers: [worker_1, worker_2]})
        rpc.set(fakeId_2, fakeAPI_2, {workers: [worker_3]})

        expect(worker_1.addEventListener).toHaveBeenCalledTimes(1)
        expect(worker_2.addEventListener).toHaveBeenCalledTimes(1)
        expect(worker_3.addEventListener).toHaveBeenCalledTimes(1)
      })
    })

    describe('handle requests', () => {
      function simulateRequest(data) {
        const handler = messageHandler.addSingleHandler.calls.mostRecent().args[0]
        const port = jasmine.createSpyObj(['postMessage'])
        const promise = handler({data: Object.assign({__port: port}, data)})
        return {port, promise}
      }

      describe('request for API description', () => {
        it('should return the API description on request', () => {
          spyOn(appsRegistrar, 'getAppById').and.returnValue(fakeAPI)
          rpc.set(fakeId, fakeAPI)
          const {port} = simulateRequest({intent: Intents.REQUEST_API, appId: fakeId})
          expect(port.postMessage).toHaveBeenCalledWith({identity: true})
        })
        it('should return a null description if the app is not registered', () => {
          rpc.set(fakeId, fakeAPI)
          const {port} = simulateRequest({intent: Intents.REQUEST_API, appId: 'some-other-id'})
          expect(port.postMessage).toHaveBeenCalledWith(null)
        })
      })

      describe('request for method invocation', () => {
        it('should return the result for function invocation with the RESOLVE intent if successful', done => {
          spyOn(appsRegistrar, 'getAppData').and.returnValue({app: fakeAPI})
          rpc.set(fakeId, fakeAPI)
          const {port, promise} = simulateRequest({
            intent: Intents.INVOKE_FUNCTION,
            appId: fakeId,
            call: 'identity',
            args: serializeArgs([1]).args
          })
          promise
            .then(() => {
              expect(port.postMessage).toHaveBeenCalledWith({intent: Intents.RESOLVE, result: 1})
            })
            .then(done)
        })
        it('should return the thrown exception during function execution if any', done => {
          const errorMessage = 'some message'
          const badApi = {
            bad() {
              throw new Error(errorMessage)
            }
          }
          spyOn(appsRegistrar, 'getAppData').and.returnValue({app: badApi})
          rpc.set(fakeId, {badApi})
          const {port, promise} = simulateRequest({
            intent: Intents.INVOKE_FUNCTION,
            appId: fakeId,
            call: 'bad',
            args: []
          })
          promise.then(() => {
            expect(port.postMessage).toHaveBeenCalledWith({intent: Intents.REJECT, result: {type: 'Error', message: errorMessage, stack: jasmine.any(String)}})
          }).then(done)
        })
        it('should call a callback if one was sent', () => {
          const onApiCall = jasmine.createSpy('onApiCall')
          spyOn(appsRegistrar, 'getAppData').and.returnValue({app: fakeAPI, onApiCall})
          rpc.set(fakeId, fakeAPI, {onApiCall})
          simulateRequest({
            intent: Intents.INVOKE_FUNCTION,
            appId: fakeId,
            call: 'identity',
            args: [1]
          })
          expect(onApiCall).toHaveBeenCalledWith({appId: fakeId, call: 'identity', args: [1]})
        })
      })
    })
  })

  describe('request API', () => {
    const fakeId = 'someID'
    const requestMessage = {intent: Intents.REQUEST_API, appId: fakeId}

    describe('when requester is iframe', () => {
      beforeEach(() => {
        spyOn(windowModule, 'isWebWorker').and.returnValue(false)
      })
      it('should throw if target is not defined', () => {
        expect(() => rpc.request(fakeId)).toThrowError('Invalid target')
        expect(() => rpc.request(fakeId, {})).toThrowError('Invalid target')
        expect(() => rpc.request(fakeId, {target: undefined})).toThrowError('Invalid target')
      })

      it('should send a channel message when the target is a content window', () => {
        const thenSpy = jasmine.createSpy('then')
        spyOn(messageManager, 'send').and.returnValue({then: thenSpy})
        const target = {}
        rpc.request(fakeId, {target})
        expect(messageManager.send).toHaveBeenCalledWith(requestMessage, {target, targetOrigin: '*'})
      })

      it('should send a channel message when the target is an iframe element', () => {
        const thenSpy = jasmine.createSpy('then')
        spyOn(messageManager, 'send').and.returnValue({then: thenSpy})
        const target = {contentWindow: {}, src: 'someSrc'}
        rpc.request(fakeId, {target})
        expect(messageManager.send).toHaveBeenCalledWith(requestMessage, {
          target: target.contentWindow,
          targetOrigin: target.src
        })
      })

      it('should send a channel message to the iframe with the initiator id given', () => {
        const thenSpy = jasmine.createSpy('then')
        spyOn(messageManager, 'send').and.returnValue({then: thenSpy})
        const target = {contentWindow: {}, src: 'someSrc'}
        spyOn(windowModule, 'getChildFrameById').and.returnValue(target)
        rpc.request(fakeId, {initiator: 'iframeID'})
        expect(messageManager.send).toHaveBeenCalledWith(requestMessage, {
          target: target.contentWindow,
          targetOrigin: target.src
        })
      })
    })
    describe('when requester is worker', () => {
      beforeEach(() => {
        spyOn(windowModule, 'isWebWorker').and.returnValue(true)
      })

      it('should send a channel message to self', () => {
        const thenSpy = jasmine.createSpy('then')
        spyOn(messageManager, 'send').and.returnValue({then: thenSpy})
        rpc.request(fakeId)
        expect(messageManager.send).toHaveBeenCalledWith(requestMessage, {target: self, targetOrigin: '*'})
      })
    })
    describe('construct API on response', () => {
      const fakeTarget = {target: {}}

      it('should construct an API from the description returned', done => {
        spyOn(messageManager, 'send').and.returnValue(Promise.resolve({identity: true}))
        rpc.request(fakeId, fakeTarget)
          .then(api => {
            expect(typeof api.identity).toBe('function')
          })
          .then(done)
      })
      it('should reject the promise if the description is returned as null', done => {
        spyOn(messageManager, 'send').and.returnValue(Promise.resolve(null))
        rpc.request(fakeId, fakeTarget)
          .catch(err => {
            expect(err.message).toBe(`App with ID ${fakeId} not found`)
          })
          .then(done)
      })
    })
    describe('invoke API method', () => {
      const fakeTarget = {target: {}}

      it('should send a correct message', done => {
        const call = 'identity'
        spyOn(messageManager, 'send').and.returnValue(Promise.resolve({[call]: true}))
        rpc.request(fakeId, fakeTarget)
          .then(api => {
            api[call](1)
            expect(messageManager.send).toHaveBeenCalledWith({
              intent: Intents.INVOKE_FUNCTION,
              call,
              args: serializeArgs([1]).args,
              appId: fakeId
            }, {target: fakeTarget.target, targetOrigin: '*'}, [])
          })
          .then(done)
      })

      it('should resolve the value if the intent is RESOLVE', done => {
        const call = 'identity'
        const result = 1
        spyOn(messageManager, 'send').and.returnValue(Promise.resolve({[call]: true}))
        rpc.request(fakeId, fakeTarget)
          .then(api => {
            messageManager.send.and.returnValue(Promise.resolve({intent: Intents.RESOLVE, result}))
            return api[call](1)
          })
          .then(res => {
            expect(res).toBe(result)
          })
          .then(done)
      })
      it('should reject the value if the intent is REJECT', done => {
        const call = 'fail'
        const result = 'because'
        spyOn(messageManager, 'send').and.returnValue(Promise.resolve({[call]: true}))
        rpc.request(fakeId, fakeTarget)
          .then(api => {
            messageManager.send.and.returnValue(Promise.resolve({intent: Intents.REJECT, result}))
            return api[call]()
          })
          .catch(reason => {
            expect(reason).toBe(result)
          })
          .then(done)
      })
    })
    describe('when request is in node', () => {
      let _parent
      beforeEach(() => {
        _parent = window.parent
        delete window.parent
      })

      afterEach(() => {
        window.parent = _parent
      })
      it('should not fail when parent is missing', () => {
        expect(() => rpc.request(fakeId)).toThrowError('Invalid target')
      })
    })

    it('should make sure that single handler is added when requesting API', () => {
      spyOn(windowModule, 'isWebWorker').and.returnValue(true)
      spyOn(messageHandler, 'addSingleHandler')
      rpc.request(fakeId)
      expect(messageHandler.addSingleHandler).toHaveBeenCalledWith(jasmine.any(Function))
    })
  })

  describe('unset API', () => {
      beforeEach(() => {
        spyOn(appsRegistrar, 'unregisterApp')
        spyOn(appsRegistrar, 'isEmpty')
        spyOn(messageHandler, 'removeSingleHandler')
      })

      it('should use appsRegistrar to remove app', () => {
        const appId = 'appId'
        rpc.unset(appId)
        expect(appsRegistrar.unregisterApp).toHaveBeenCalledWith(appId)
      })

    it('should remove event listener if there are no more apps', () => {
      const appId = 'appId2'
      appsRegistrar.isEmpty.and.returnValue(true)
      rpc.unset(appId)
      rpc.unset(appId)
      expect(appsRegistrar.unregisterApp).toHaveBeenCalledWith(appId)
      expect(messageHandler.removeSingleHandler).toHaveBeenCalledWith(jasmine.any(Function))
    })
  })
})