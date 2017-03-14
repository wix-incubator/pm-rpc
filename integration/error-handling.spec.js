import * as pmrpc from '../src/pm-rpc/index.js'
describe('Error handling', () => {
  let worker
  let api

  beforeAll(done => {
    worker = new Worker('/base/integration/content/error-handling/worker.js')
    pmrpc.api.request('errors', {target: worker})
      .then(_api => api = _api)
      .then(() => done())
  })

  it('should reject with a SyntaxError if it was thrown', done => {
    api.throwSyntaxError('syntax error')
      .then(done.fail, err => {
        expect(err.constructor).toBe(SyntaxError)
        expect(err.message).toBe('syntax error')
      })
      .then(done)
  })

  it('should reject with a regular Error if a custom error type was thrown', done => {
    api.throwCustomError('custom error')
      .then(done.fail, err => {
        expect(err.constructor).toBe(Error)
        expect(err.message).toBe('custom error')
      })
      .then(done)
  })

  it('should reject with a SyntaxError if it was rejected', done => {
    api.rejectSyntaxError('syntax error')
      .then(done.fail, err => {
        expect(err.constructor).toBe(SyntaxError)
        expect(err.message).toBe('syntax error')
      })
      .then(done)
  })

  it('should reject with a regular Error if a custom error type was rejected', done => {
    api.throwCustomError('custom error')
      .then(done.fail, err => {
        expect(err.constructor).toBe(Error)
        expect(err.message).toBe('custom error')
      })
      .then(done)
  })

  it('should reject with a thrown value if it is not an error', done => {
    api.throwMessage('message')
      .then(done.fail, err => {
        expect(err).toBe('message')
      })
      .then(done)
  })

  it('should reject a rejected value if it is not an error', done => {
    api.rejectMessage('message')
      .then(done.fail, err => {
        expect(err).toBe('message')
      })
      .then(done)
  })

  afterAll(() => worker.terminate())
})