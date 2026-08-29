// The WebGL scene state that a route change has to reset alongside the document.

let sceneRunning = true

// Lenis and WebGL share the legacy core ticker. Pausing that ticker on a routed
// page also pauses Lenis after it has consumed trackpad/wheel input, leaving
// the document and the custom scrollbar unable to move. Routed-page CSS hides
// the canvas; keep the shared clock alive so scrolling remains deterministic.
export const setSceneRunning = running => {
  if (sceneRunning === running) return
  const ticker = window.__FARA_APP_EXPORTS?.a?.core?.ticker
  sceneRunning = running
  ticker?.play?.()
}

// The scene follows the document through a damped value of its own, and the
// engine resyncs that follower itself every time it swaps pages. Our route
// swap comes from the shell and never goes through that path, so the follower
// is left easing toward the offset the previous page had - which is the motion
// still visible behind the navbar after the gate has gone. Reset alongside the
// document, and only ever while the document is deliberately pinned at the top.
export const pinSceneToTop = () => {
  const webgl = window.__FARA_APP_EXPORTS?.a?.webgl
  if (!webgl) return
  webgl.lerpedScrollProgress = 0
  webgl.previousScrollProgress = 0
}
