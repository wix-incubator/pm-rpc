import * as pmrpc from '../src/pm-rpc/index'
fdescribe('single iframe', () => {
  it('should be able to run functions from deep namespaces', done => {
    const innerSpy = jasmine.createSpy('namespace.f')
    const app = {
      namespace: {
        f: () => innerSpy()
      }
    }
    const name = 'deep-namespaces'
    pmrpc.api.set(name, app)
    pmrpc.api.request(name, {target: window})
      .then(api => api.namespace.f())
      .then(() => {
        expect(innerSpy).toHaveBeenCalled()
      })
      .then(() => pmrpc.api.unset(name))
      .then(done, done.fail)
  })

  it('should be able to accept functions as namespaces', done => {
    const name = 'functions-as-namespaces'
    const app = {
      f: () => 1
    }
    app.f.g = x => x
    pmrpc.api.set(name, app)
    pmrpc.api.request(name, {target: window})
      .then(api => api.f.g(2))
      .then(result => {
        expect(result).toBe(2)
      })
      .then(() => pmrpc.api.unset(name))
      .then(done, done.fail)
  })
})