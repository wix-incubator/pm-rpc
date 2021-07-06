import _ from 'lodash'
import {send} from '../messageManager'

function createTarget() {
  const {port1, port2} = new MessageChannel()
  port1.onmessage = _.noop
  spyOn(port2, 'postMessage').and.callThrough()
  return port2
}

async function sendWithResolve(message, ...rest) {
  // `send` sets `.__port` property
  const sendPromise = send(message, ...rest)

  message.__port.postMessage({intent: 'resolve', result: 'b206275b931a'})

  // i could't get `send` to resolve even with `message.__port.postMessage`, so i'm doing `setTimeout` instead
  // (errors thrown by `send` still bubble up to here)
  // https://github.com/wix/pm-rpc/pull/25#discussion_r663927282
  return Promise.race([
    sendPromise,
    new Promise(r => setTimeout(r, 100))
  ])
}

describe('messageManager', () => {
  describe('send', () => {
    it('should call `target.postMessage`', async () => {
      const target = createTarget()
      const message = {a: 'e45cc3a216d8'}
      await sendWithResolve(message, {target})

      expect(target.postMessage).toHaveBeenCalledWith(message, [jasmine.any(MessagePort)])
    })

    it('should not fail `target.postMessage` for messages with Proxy', async () => {
      const target = createTarget()
      const message = {a: '34de4cb70fd9', c: new Proxy({d: 0}, {get: _.constant(1)})}
      await sendWithResolve(message, {target})

      expect(target.postMessage).toHaveBeenCalledWith(message, [jasmine.any(MessagePort)])
    })
  })
})
