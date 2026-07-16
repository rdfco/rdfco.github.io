export const setupNavigationEvents = () => {
  if (document.documentElement.dataset.faraNavigationReady === 'true') return
  document.documentElement.dataset.faraNavigationReady = 'true'

  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[data-fara-route]')
    if (!link) return
    event.preventDefault()
    event.stopImmediatePropagation()
    window.parent.postMessage({ type: 'fara:navigate', pathname: link.dataset.faraRoute }, window.location.origin)
  }, true)
}
