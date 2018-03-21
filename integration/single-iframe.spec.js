import * as pmrpc from '../src/pm-rpc/index'
import {waitForIframeLoaded} from './util/util'

describe('single iframe', () => {
  let iframe
  it('should be able to create an iframe and use an API from it', async () => {
    iframe = document.createElement('iframe')
    iframe.src = '/base/integration/content/single-iframe/single-frame.html'
    document.body.appendChild(iframe)
    await waitForIframeLoaded(iframe)
    const api = await pmrpc.api.request('123', {target: iframe.contentWindow})
    const name = 'spider pig'
    expect(await api.resolveName(name)).toBe(name)
    try {
      await api.rejectPromise()
      throw new Error('reached code that should be unreachable')
    } catch (err) {
      expect(err).toBe('rejected promise')
    }
  })
  afterAll(() => document.body.removeChild(iframe))
})