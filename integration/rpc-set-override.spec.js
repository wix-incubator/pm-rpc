import * as pmrpc from '../src/pm-rpc/index'
describe('rpc.set override', () => {

    it('should set new api whhen the name is the same. should unregister the old one and register the new one', done => {
        const name = 'functions-as-namespaces'
        const func1 = jasmine.createSpy('func1')
        const func2 = jasmine.createSpy('func2')
        pmrpc.api.set(name, {func1})
        pmrpc.api.request(name, {target: window})
            .then(api => {
                expect(api.func1).toBeDefined()
                expect(api.func2).not.toBeDefined()

                pmrpc.api.set(name, {func2})
                pmrpc.api.request(name, {target: window})
                    .then(api => {
                        expect(api.func1).not.toBeDefined()
                        expect(api.func2).toBeDefined()
                        pmrpc.api.unset(name)
                        done()
                    })
            })
           .catch(done.fail)

    })
})