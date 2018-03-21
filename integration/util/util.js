
export function waitForIframeLoaded(iframe) {
  return new Promise(resolve => {
    iframe.addEventListener('load', resolve)
  })
}
