import * as pmrpc from '../src/pm-rpc/index'
import noop from 'lodash/noop'
import identity from 'lodash/identity'
xdescribe('rpc.set override', () => {
  it('should set new api when the name is the same. should unregister the old one and register the new one', async () => {
    const name = 'rpc-reset'
    const func1 = noop
    const func2 = identity
    pmrpc.api.set(name, {func1})
    const api1 = await pmrpc.api.request(name, {target: window})
    expect(api1.func1).toBeDefined()
    expect(api1.func2).not.toBeDefined()
    pmrpc.api.set(name, {func2})
    const api2 = await pmrpc.api.request(name, {target: window})
    expect(api2.func1).not.toBeDefined()
    expect(api2.func2).toBeDefined()
  })
})