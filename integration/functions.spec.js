import * as pmrpc from '../src/pm-rpc/index'
import {waitForIframeLoaded} from './util/util'

describe('passing functions iframe', () => {
  let iframe

  it('should be able to pass functions as arguments', async () => {
    iframe = document.createElement('iframe')
    iframe.src = '/base/integration/content/functions/single-frame.html'
    document.body.appendChild(iframe)
    await waitForIframeLoaded(iframe)
    const api = await pmrpc.api.request('functions', {target: iframe.contentWindow})
    const filterOdd = arr => arr.filter(x => x % 2)
    const getNumbers = () => fetch('/base/integration/content/functions/numbers.json').then(res => res.json())
    expect(await api.maxOdd(getNumbers, filterOdd)).toBe(5)
  })
  afterAll(() => document.body.removeChild(iframe))
})