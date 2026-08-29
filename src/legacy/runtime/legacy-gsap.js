// The legacy bundle tweens targets that only exist on some routes, so it warns
// on every route that does not have them. The warning is expected, the noise is
// not. Installed from the entry point, so the boot ordering stays visible there.

const nativeWarn = console.warn.bind(console)

export const silenceLegacyGsapTargetWarnings = () => {
  console.warn = (...args) => {
    if (String(args[0] || '').startsWith('GSAP target  not found')) return
    nativeWarn(...args)
  }
}

export const silenceLegacyGsapNullTargets = () => {
  window.gsap?.config?.({ nullTargetWarn: false })
}

export const prepareLegacyGsap = () => {
  let attempts = 0
  const timer = window.setInterval(() => {
    attempts += 1
    silenceLegacyGsapNullTargets()
    if (window.gsap || attempts >= 20) window.clearInterval(timer)
  }, 100)
}
