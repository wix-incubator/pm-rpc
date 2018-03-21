import * as pmrpc from '../../../src/pm-rpc'
pmrpc.api.set('deep-namespaces', {
  namespace: {
    f: x => x
  }
})
const functionAsNamespace = {
  f: () => 1
}
functionAsNamespace.f.g = x => x
pmrpc.api.set('functions-as-namespaces', functionAsNamespace)