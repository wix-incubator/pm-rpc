import * as pmrpc from '../src/pm-rpc/index'
import {waitForIframeLoaded} from './util/util'

xdescribe('web worker inside an iframe', () => {
  let iframe
  beforeAll(async () => {
    iframe = document.createElement('iframe')
    iframe.src = '/base/integration/content/client-worker-in-iframe/worker-iframe.html'
    document.body.appendChild(iframe)
    await waitForIframeLoaded(iframe)
  })

  it('should send multiple APIs to a worker inside an iframe correctly', async () => {
    const resolvers = []
    const apiSuccessPromises = [0, 1].map(i => new Promise(resolve => {resolvers[i] = resolve}))

    const firstAPI = {resolve(id) {resolvers[0](id)}}
    const secondAPI = {resolve(id) {resolvers[1](id)}}
    pmrpc.api.set('first', firstAPI)
    pmrpc.api.set('second', secondAPI)

    expect(await Promise.all(apiSuccessPromises)).toEqual(['first', 'second'])
  })
  afterAll(() => {
    document.body.removeChild(iframe)
    pmrpc.api.unset('first')
    pmrpc.api.unset('second')
  })
})