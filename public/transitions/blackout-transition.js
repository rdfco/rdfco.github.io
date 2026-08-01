/* global console, document, window */

// Visual scroll offsets only. These never modify connector/chapter timing.
export const FOG_START_OFFSET = -2300
export const FULL_BLACK_OFFSET = -2500
export const REVEAL_START_OFFSET = -300
export const REVEAL_END_OFFSET = -700

/**
 * Visual-only timing controls. All offsets are scroll pixels and never alter
 * the Energy Continuation chapter or connector ranges.
 *
 * - startOffset: moves Blackout Start relative to connector.start.
 * - fullyBlackOffset: moves Fully Black relative to the connector midpoint.
 * - revealStartOffset: moves Reveal Start relative to instance.start.
 * - endOffset: moves Reveal End relative to its automatic end position.
 *
 * Negative values begin earlier; positive values begin/end later.
 * fogDepth controls the width of each soft side-front in viewport percent.
 * fogSoftness controls blur in pixels. fogDensity controls cloud layers.
 */
export const BLACKOUT_CONFIG = {
  enabled: true,
  startOffset: FOG_START_OFFSET,
  fullyBlackOffset: FULL_BLACK_OFFSET,
  revealStartOffset: REVEAL_START_OFFSET,
  endOffset: REVEAL_END_OFFSET,
  revealCurve: 'easeInOut',
  fogDepth: 26,
  fogSoftness: 26,
  fogDensity: 16,
  opacity: 1,
  contentUrl: '/src/content/industries.json',
  debug: false,
}

const OVERLAY_ATTRIBUTE = 'data-fara-blackout-transition'
const minimumRange = 1

const clamp = (value) => Math.min(1, Math.max(0, value))

const easing = {
  linear: (value) => value,
  easeInOut: (value) => 0.5 - 0.5 * Math.cos(Math.PI * value),
}

const createFogMask = (progress, config) => {
  const depth = config.fogDepth
  const layersPerSide = Math.max(1, Math.floor(config.fogDensity / 2))
  const front = progress * 58
  const layers = Array.from({ length: layersPerSide * 2 }, (_, index) => {
    const fromLeft = index < layersPerSide
    const sideIndex = index % layersPerSide
    const direction = fromLeft ? 1 : -1
    const phase = progress * Math.PI * 2
    const edge = fromLeft ? front : 100 - front
    const x =
      edge + direction * Math.sin(phase * (1.07 + (sideIndex % 3) * 0.19) + index * 2.31) * depth * 0.32
    const y =
      ((sideIndex + 0.5) / layersPerSide) * 100 +
      Math.sin(phase * (0.73 + (sideIndex % 4) * 0.11) + index * 1.73) * 13
    const width = depth * (0.72 + (sideIndex % 4) * 0.14)
    const height = 24 + (sideIndex % 5) * 7
    return `radial-gradient(ellipse ${width}% ${height}% at ${x.toFixed(
      2,
    )}% ${y.toFixed(2)}%,#000 0%,rgba(0,0,0,.78) 38%,transparent 76%)`
  })
  const solidStop = Math.max(0, front - depth * 0.68)
  const softStop = Math.min(100, front + depth * 0.62)
  const leftSolid = `linear-gradient(to right,#000 0%,#000 ${solidStop}%,rgba(0,0,0,.68) ${front}%,transparent ${softStop}%)`
  const rightSolid = `linear-gradient(to left,#000 0%,#000 ${solidStop}%,rgba(0,0,0,.68) ${front}%,transparent ${softStop}%)`

  return [...layers, leftSolid, rightSolid].join(',')
}

const escapeSvgText = (value) =>
  String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const createOverlay = () => {
  const existing = document.querySelector(`[${OVERLAY_ATTRIBUTE}]`)
  if (existing) return existing

  const overlay = document.createElement('div')
  overlay.setAttribute(OVERLAY_ATTRIBUTE, '')
  overlay.setAttribute('aria-hidden', 'true')
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'width:100vw',
    'height:100vh',
    'overflow:hidden',
    'background:#000',
    'display:grid',
    'place-items:center',
    'color:transparent',
    'font:500 clamp(2rem,6vw,5.5rem)/1 sans-serif',
    'letter-spacing:0',
    'opacity:0',
    'pointer-events:none',
    'z-index:2147483646',
    'clip-path:inset(100% 0 0 0)',
    'will-change:filter,mask-image,opacity,transform',
    'contain:strict',
  ].join(';')
  const content = document.createElement('div')
  content.setAttribute('data-fara-blackout-content', '')
  content.style.cssText = [
    'display:flex',
    'flex-direction:column',
    'align-items:flex-start',
    'gap:clamp(.8rem,1.8vh,1.6rem)',
    'width:100%',
    'max-width:94vw',
    'text-align:left',
    'color:#fff',
    'opacity:1',
    'will-change:transform,opacity',
  ].join(';')
  overlay.append(content)
  document.body.append(overlay)
  return overlay
}

const getLandmarks = (connector, instance, config) => {
  const connectorLength = Math.max(minimumRange, connector.end - connector.start)
  const halfConnector = connectorLength / 2
  const blackoutStart = connector.start + config.startOffset
  const fullyBlack = connector.start + halfConnector + config.fullyBlackOffset
  const revealStart = instance.start + config.revealStartOffset
  const revealEnd = instance.start + halfConnector + config.endOffset

  return {
    blackoutStart,
    fullyBlack: Math.max(blackoutStart + minimumRange, fullyBlack),
    revealStart: Math.max(fullyBlack, revealStart),
    revealEnd: Math.max(revealStart + minimumRange, revealEnd),
  }
}

const createDebugBackground = (landmarks) => {
  const rows = [
    ['Blackout Start', landmarks.blackoutStart],
    ['Fully Black', landmarks.fullyBlack],
    ['Reveal Start', landmarks.revealStart],
    ['Reveal End', landmarks.revealEnd],
  ]
  const content = rows
    .map(
      ([label, value], index) =>
        `<line x1="12" y1="${24 + index * 24}" x2="310" y2="${
          24 + index * 24
        }" stroke="#00ff9d" stroke-width="1"/>` +
        `<text x="16" y="${19 + index * 24}" fill="#00ff9d" ` +
        `font-family="monospace" font-size="12">${escapeSvgText(`${label}: ${value.toFixed(1)}`)}</text>`,
    )
    .join('')
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="322" height="112">` +
    `<rect width="322" height="112" fill="rgba(0,0,0,.72)"/>${content}</svg>`

  return `#000 url("data:image/svg+xml,${encodeURIComponent(svg)}") 12px 12px / 322px 112px no-repeat`
}

/**
 * Creates one fixed DOM layer. Call update(scroll) from the host render tick.
 * getRanges must return the existing connector and instance objects.
 */
export const createBlackoutTransition = ({ gsap, getRanges, config = BLACKOUT_CONFIG } = {}) => {
  if (typeof getRanges !== 'function') {
    throw new TypeError('Blackout transition requires getRanges().')
  }

  const overlay = createOverlay()
  const content = overlay.querySelector('[data-fara-blackout-content]')
  let titleTimeline = null
  let titleReady = false
  const buildTitleTimeline = () => {
    if (!titleReady || !gsap) return
    titleTimeline?.kill()
    const lines = Array.from(content.children)
    const enterDuration = 1
    const lineStagger = 0.82
    titleTimeline = gsap.timeline({ paused: true })
    lines.forEach((line, index) => {
      const startX = window.innerWidth * 1.08
      const start = index * lineStagger
      titleTimeline
        .fromTo(line, {
          x: startX,
          autoAlpha: 0,
        }, {
          x: 0,
          autoAlpha: 1,
          duration: enterDuration,
          ease: 'none',
        }, start)
    })
    const exitStart = (lines.length - 1) * lineStagger + enterDuration
    lines.forEach(line => {
      const lineWidth = line.getBoundingClientRect().width
      titleTimeline.to(line, {
        x: -(lineWidth + window.innerWidth * 0.08),
        autoAlpha: 0,
        duration: 1.25,
        ease: 'none',
      }, exitStart)
    })
    titleTimeline.progress(0)
  }
  const title = document.createElement('strong')
  title.textContent = 'INSIDER INTELLIGENCE'
  title.style.cssText = 'font:700 clamp(3.4rem,7vw,7.4rem)/1.05 "FARA Gotham",sans-serif;white-space:nowrap;'
  const subtitle = document.createElement('span')
  subtitle.textContent = 'Defining The Future'
  subtitle.style.cssText = 'font:500 clamp(2.5rem,5vw,5.2rem)/1 "FARA Gotham",sans-serif;letter-spacing:.04em;white-space:nowrap;'
  const description = document.createElement('p')
  description.textContent = 'Dare to Disrupt'
  description.style.cssText = 'margin:0;font:500 clamp(1.8rem,3.2vw,3.4rem)/1.1 "FARA Gotham",sans-serif;letter-spacing:.04em;white-space:nowrap;'
  content.replaceChildren(title, subtitle, description)
  titleReady = true
  buildTitleTimeline()
  window.addEventListener('resize', buildTitleTimeline, { passive: true })
  let lastClip = ''
  let lastMask = ''
  let lastOpacity = ''
  let lastDebugSignature = ''
  let lastDebugProgress = ''

  const render = (visibleAmount, opacity, revealing = false) => {
    const atEndpoint = visibleAmount <= 0 || visibleAmount >= 1
    let clip

    if (atEndpoint) {
      clip = visibleAmount >= 1 ? 'inset(0% 0 0 0)' : revealing ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)'
    } else {
      clip = 'inset(0% 0 0 0)'
    }
    const nextOpacity = String(opacity)
    if (clip !== lastClip) {
      overlay.style.clipPath = clip
      lastClip = clip
    }
    const mask = atEndpoint ? 'none' : createFogMask(visibleAmount, config)
    if (mask !== lastMask) {
      overlay.style.maskImage = mask
      overlay.style.webkitMaskImage = mask
      lastMask = mask
    }
    if (nextOpacity !== lastOpacity) {
      overlay.style.opacity = nextOpacity
      lastOpacity = nextOpacity
    }
    overlay.style.filter = atEndpoint || config.fogSoftness <= 0 ? 'none' : `blur(${config.fogSoftness}px)`
    overlay.style.transform = atEndpoint || config.fogSoftness <= 0 ? 'none' : 'scale(1.06)'
  }

  const update = (scroll) => {
    if (!config.enabled) {
      render(0, 0)
      return
    }

    const ranges = getRanges()
    const connector = ranges?.connector
    const instance = ranges?.instance
    if (!connector || !instance) {
      render(0, 0)
      return
    }

    const landmarks = getLandmarks(connector, instance, config)
    const landmarkSignature = Object.values(landmarks).join(':')
    if (landmarkSignature !== overlay.dataset.landmarkSignature) {
      overlay.dataset.landmarkSignature = landmarkSignature
      overlay.dataset.blackoutStart = String(landmarks.blackoutStart)
      overlay.dataset.fullyBlack = String(landmarks.fullyBlack)
      overlay.dataset.revealStart = String(landmarks.revealStart)
      overlay.dataset.revealEnd = String(landmarks.revealEnd)
    }
    const curve = easing[config.revealCurve] || easing.easeInOut
    const coverProgress = clamp(
      (scroll - landmarks.blackoutStart) / (landmarks.fullyBlack - landmarks.blackoutStart),
    )
    const revealProgress = clamp(
      (scroll - landmarks.revealStart) / (landmarks.revealEnd - landmarks.revealStart),
    )
    const visibleAmount = scroll < landmarks.revealStart ? curve(coverProgress) : 1 - curve(revealProgress)
    const opacity = clamp(config.opacity)
    const titleProgress = clamp(
      (scroll - landmarks.fullyBlack) / (landmarks.revealStart - landmarks.fullyBlack),
    )
    titleTimeline?.progress(titleProgress, false)

    render(visibleAmount, visibleAmount > 0 ? opacity : 0, scroll >= landmarks.revealStart)

    if (config.debug) {
      const signature = landmarkSignature
      if (signature !== lastDebugSignature) {
        overlay.style.background = createDebugBackground(landmarks)
        console.table(landmarks)
        lastDebugSignature = signature
      }
      const progressSignature = `${coverProgress.toFixed(3)}:${revealProgress.toFixed(3)}`
      if (progressSignature !== lastDebugProgress) {
        console.debug('[BlackoutTransition]', {
          scroll,
          coverProgress,
          revealProgress,
          visibleAmount,
        })
        lastDebugProgress = progressSignature
      }
    } else if (lastDebugSignature) {
      overlay.style.background = '#000'
      lastDebugSignature = ''
      lastDebugProgress = ''
    }
  }

  const destroy = () => {
    window.removeEventListener('resize', buildTitleTimeline)
    titleTimeline?.kill()
    overlay.remove()
  }

  return { update, destroy }
}
