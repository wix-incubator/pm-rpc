import * as pmrpc from '../src/pm-rpc/index.js'
describe('Error handling', () => {
  let worker
  let api

  beforeAll(async () => {
    worker = new Worker('/base/integration/content/error-handling/worker.js')
    api = await pmrpc.api.request('errors', {target: worker})
  })

  it('should reject with a SyntaxError if it was thrown', async () => {
    let err
    const message = 'syntax error'
    try {
      await api.throwSyntaxError(message)
    } catch (e) {
      err = e
    }
    expect(() => {throw err}).toThrowError(SyntaxError, message)
  })

  it('should reject with a regular Error if a custom error type was thrown', async () => {
    let err
    const message = 'custom error'
    try {
      await api.throwCustomError(message)
    } catch (e) {
      err = e
    }
    expect(() => {throw err}).toThrowError(Error, message)
  })

  it('should reject with a SyntaxError if it was rejected', async () => {
    let err
    const message = 'syntax error'
    try {
      await api.rejectSyntaxError(message)
    } catch (e) {
      err = e
    }
    expect(() => {throw err}).toThrowError(Error, message)
  })

  it('should reject with a regular Error if a custom error type was rejected', async () => {
    let err
    const message = 'custom error'
    try {
      await api.throwCustomError(message)
    } catch (e) {
      err = e
    }
    expect(() => {throw err}).toThrowError(Error, message)
  })

  it('should reject with a thrown value if it is not an error', async () => {
    let err
    const message = 'message'
    try {
      await api.throwMessage(message)
    } catch (e) {
      err = e
    }
    expect(err).toBe(message)
  })

  it('should reject a rejected value if it is not an error', async () => {
    let err
    const message = 'message'
    try {
      await api.rejectMessage(message)
    } catch (e) {
      err = e
    }
    expect(err).toBe(message)
  })

  afterAll(() => worker.terminate())
})