import _ from 'lodash'
import {serialize as serialize, deserialize as deserialize} from '../argumentsSerializer'
import {send} from '../messageManager'

class MockWorker {
  constructor(stringUrl) {
    this.url = stringUrl
    this.addEventListener = jasmine.createSpy('workerAddEventListener')
  }
}
beforeEach(() => {
  global.Worker = MockWorker //eslint-disable-line
})

afterEach(() => {
  delete global.Worker //eslint-disable-line
})

describe('argumentsSerializer', () => {
  const wrapValue = value => ({type: 'value', value})
  const literals = [0, [1, 2], {3: 4}]
  describe('serialize', () => {
    it('should turn simple values into value descriptors', () => {
      expect(serialize(literals)).toEqual({transfer: [], args: _.map(literals, wrapValue)})
    })
    it('should serialize functions into the transfer argument', done => {
      const functions = [x => x, x => x + 1]
      const {args, transfer} = serialize(functions)
      for (const arg of args) {
        expect(_.includes(transfer, arg.port)).toBe(true)
      }
      Promise.all(_.map(args, arg => send([0], {target: arg.port})))
        .then(results => {
          expect(results).toEqual(_.map(functions, f => ({intent: 'resolve', result: f(0)})))
        })
        .then(done)
    })
  })

  describe('deserialize', () => {
     it('should turn simple value descriptors into simple values', () => {
         const serialized = _.map(literals, wrapValue)
         expect(deserialize(serialized, [])).toEqual(literals)
     })

    it('should turn function coded descriptors into functions that call them', async () => {
      const {port1, port2} = new MessageChannel()
      const serialized = [{type: 'function', port: port2}]
      const remote = deserialize(serialized)
      port1.onmessage = ({data}) => {
        data.__port.postMessage({intent: 'resolve', result: data[0] + 1})
      }
      expect(await remote[0](1)).toBe(2)
    })
  })
})