// Menu state travelling out to the shell, and waiting for the menu to finish
// closing before a navigation continues.

const postMenuState = open => {
  window.parent.postMessage({ type: 'fara:menu-state', open }, window.location.origin)
}

export const setupMenuStateSync = () => {
  const root = document.documentElement
  const sync = () => {
    const menuBusy = root.classList.contains('fara-menu-open')
      || root.classList.contains('fara-menu-closing')
    postMenuState(menuBusy)
  }
  sync()
  const observer = new MutationObserver(sync)
  observer.observe(root, { attributes: true, attributeFilter: ['class'] })
}

export const waitForMenuClose = shouldClose => new Promise(resolve => {
  const menu = document.querySelector('.fara-menu')
  const isOpen = menu?.classList.contains('active') || menu?.classList.contains('is-closing')
  if (!shouldClose || !isOpen) {
    resolve()
    return
  }
  let done = false
  const finish = () => {
    if (done) return
    done = true
    window.clearTimeout(timer)
    window.removeEventListener('fara:menu-closed', finish)
    resolve()
  }
  const timer = window.setTimeout(finish, 1800)
  window.addEventListener('fara:menu-closed', finish, { once: true })
  window.dispatchEvent(new CustomEvent('fara:close-menu', { detail: { animate: true } }))
})
