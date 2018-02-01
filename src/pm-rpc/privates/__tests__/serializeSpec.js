import map from 'lodash/map'
import includes from 'lodash/includes'
import {serialize as serialize, deserialize as deserialize} from '../argumentsSerializer'
import {send} from '../messageManager'

describe('argumentsSerializer', () => {
  const wrapValue = value => ({type: 'value', value})
  const literals = [0, [1, 2], {3: 4}]
  describe('serialize', () => {
    it('should turn simple values into value descriptors', () => {
      expect(serialize(literals)).toEqual({transfer: [], args: map(literals, wrapValue)})
    })
    it('should serialize functions into the transfer argument', done => {
      const functions = [x => x, x => x + 1]
      const {args, transfer} = serialize(functions)
      for (const arg of args) {
        expect(includes(transfer, arg.port)).toBe(true)
      }
      Promise.all(map(args, arg => send([0], {target: arg.port})))
        .then(results => {
          expect(results).toEqual(map(functions, f => ({intent: 'resolve', result: f(0)})))
        })
        .then(done)
    })
  })

  describe('deserialize', () => {
     it('should turn simple value descriptors into simple values', () => {
         const serialized = map(literals, wrapValue)
         expect(deserialize(serialized, [])).toEqual(literals)
     })

    it('should turn function coded descriptors into functions that call them', done => {
      const serialized = [{type: 'function', index: 0}]
      const {port1, port2} = new MessageChannel()
      const remote = deserialize(serialized, [port2])
      port1.onmessage = ({data}) => {
        data.__port.postMessage({intent: 'resolve', result: data[0] + 1})
      }
      remote[0](1)
        .then(res => {
          expect(res).toBe(2)
        })
        .then(done)
    })
  })
})