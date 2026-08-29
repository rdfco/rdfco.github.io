// The shell fades its gate out over 420ms and only then is the top of the home
// page actually on screen. Nothing used to connect the two sides, so the
// section scroll started on whichever finished first - which is why the same
// click looked right from one route and wrong from another. These are the
// terms of that handshake.
export const REVEAL_PAUSE_MS = 260
export const REVEAL_WAIT_TIMEOUT_MS = 1600

export const delay = ms => new Promise(resolve => window.setTimeout(resolve, ms))

const shellSignals = { 'fara:revealed': [] }
const pendingSignal = { 'fara:revealed': false }

export const receiveShellSignal = type => {
  const waiting = shellSignals[type]
  if (!waiting) return
  if (!waiting.length) {
    pendingSignal[type] = true
    return
  }
  waiting.splice(0).forEach(resolve => resolve())
}

// Timers rather than frame counting: requestAnimationFrame stops in a
// background tab, and a visitor who switches away mid-transition has to come
// back to a page that moves, not one still pinned to the top.
export const waitForShellSignal = (type, timeoutMs) => new Promise(resolve => {
  if (pendingSignal[type]) {
    pendingSignal[type] = false
    resolve()
    return
  }
  let done = false
  const finish = () => {
    if (done) return
    done = true
    window.clearTimeout(timer)
    const waiting = shellSignals[type]
    const index = waiting.indexOf(finish)
    if (index >= 0) waiting.splice(index, 1)
    resolve()
  }
  shellSignals[type].push(finish)
  const timer = window.setTimeout(finish, timeoutMs)
})

export const armShellSignal = type => { pendingSignal[type] = false }
