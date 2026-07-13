import { useEffect, useRef } from 'react'
import { siteData } from '../data/siteData'

function setText(doc, selector, value, index = 0) {
  const node = doc.querySelectorAll(selector)[index]
  if (node && value) node.textContent = value
}

function applySiteData(doc) {
  doc.title = siteData.seo.title
  doc.querySelectorAll('#header .menu-links-w a span').forEach((node, index) => {
    if (siteData.navigation[index]) node.textContent = siteData.navigation[index].label
  })
  setText(doc, 'main h2', siteData.introduction.title)
  setText(doc, 'main .description p.fs-s1', siteData.introduction.body)
  setText(doc, 'main .description .inner p', siteData.introduction.body)
  setText(doc, 'main h3', siteData.advantage.title)
  setText(doc, 'main .fs-h5', siteData.advantage.lead)
  doc.querySelectorAll('.scroll-to-cta span').forEach(node => {
    if (/scroll/i.test(node.textContent)) node.textContent = siteData.hero.scrollLabel
  })
  doc.querySelectorAll('main .title.fs-s1').forEach((node, index) => {
    if (siteData.advantage.items[index]) node.textContent = siteData.advantage.items[index].title
  })
  doc.querySelectorAll('main .title.fs-s1 + .content p, main .title.fs-s1 + p').forEach((node, index) => {
    if (siteData.advantage.items[index]) node.textContent = siteData.advantage.items[index].text
  })
  doc.querySelectorAll('.advantages-container .read-more .inner p').forEach((node, index) => {
    if (siteData.advantage.items[index]) node.textContent = siteData.advantage.items[index].text
  })
}

function setupAccordions(doc) {
  const items = [...doc.querySelectorAll('main .read-more')]
  if (!items.length) return
  const win = doc.defaultView

  const details = items.map(item => {
    const content = item.querySelector('.content-wrapper > div > .content') || item.querySelector('.content')
    const inner = content?.querySelector('.inner')
    const button = item.querySelector('.read-more-button')
    if (!content || !inner || !button) return null
    const collapsedHeight = content.getBoundingClientRect().height || parseFloat(win.getComputedStyle(content).lineHeight) * Number(item.dataset.lineCount || 3)
    content.style.height = `${collapsedHeight}px`
    content.style.overflow = 'hidden'
    content.style.transition = 'height 700ms cubic-bezier(.4, 0, .1, 1)'
    button?.setAttribute('aria-expanded', 'false')
    return { item, content, inner, button, collapsedHeight }
  }).filter(Boolean)

  const close = detail => {
    detail.item.classList.remove('expanded')
    detail.content.style.height = `${detail.inner.scrollHeight}px`
    detail.content.getBoundingClientRect()
    detail.content.style.height = `${detail.collapsedHeight}px`
    detail.button?.setAttribute('aria-expanded', 'false')
    win.setTimeout(() => {
      if (!detail.item.classList.contains('expanded')) detail.inner.classList.add('clamp')
    }, 700)
  }

  const open = detail => {
    details.forEach(other => { if (other !== detail) close(other) })
    detail.inner.classList.remove('clamp')
    detail.item.classList.add('expanded')
    detail.content.style.height = `${detail.inner.scrollHeight}px`
    detail.button?.setAttribute('aria-expanded', 'true')
    win.setTimeout(() => {
      if (detail.item.classList.contains('expanded')) detail.content.style.height = 'auto'
    }, 700)
  }

  const toggle = event => {
    const button = event.target.closest?.('.read-more-button')
    if (!button) return
    const detail = details.find(item => item.button === button)
    if (!detail) return
    event.preventDefault()
    event.stopImmediatePropagation()
    detail.item.classList.contains('expanded') ? close(detail) : open(detail)
  }

  doc.addEventListener('pointerdown', toggle, true)
  doc.addEventListener('click', toggle, true)
}

function setupCursor(doc) {
  const cursor = doc.querySelector('.cursor')
  const inner = cursor?.querySelector('.inner')
  if (!cursor || !inner) return
  const win = doc.defaultView
  let x = win.innerWidth / 2
  let y = win.innerHeight / 2

  cursor.style.pointerEvents = 'none'
  cursor.style.position = 'fixed'
  cursor.style.inset = '0'
  cursor.style.zIndex = '9999'
  inner.style.willChange = 'transform'

  const move = event => {
    x = event.clientX
    y = event.clientY
    inner.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  doc.addEventListener('mousemove', move, { passive: true })
  inner.style.transform = `translate3d(${x}px, ${y}px, 0)`
}

function setupSound(doc) {
  const button = doc.querySelector('.sound')
  const canvas = doc.querySelector('#sound-canvas')
  if (!button || !canvas) return
  const win = doc.defaultView
  const ctx = canvas.getContext('2d')
  const audio = doc.createElement('audio')
  let enabled = true

  audio.src = '/assets/sounds/sound.mp3'
  audio.loop = true
  audio.volume = 0.35
  audio.preload = 'auto'
  audio.play().catch(() => {})
  doc.body.appendChild(audio)

  const draw = time => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#2D628C'
    ctx.lineWidth = 1.6
    ctx.beginPath()
    for (let i = 0; i < canvas.width; i += 2) {
      const wave = enabled ? Math.sin((time / 140) + i * 0.75) * 4 : 0
      const y = canvas.height / 2 + wave
      i === 0 ? ctx.moveTo(i, y) : ctx.lineTo(i, y)
    }
    ctx.stroke()
    win.requestAnimationFrame(draw)
  }

  button.addEventListener('click', event => {
    event.preventDefault()
    enabled = !enabled
    audio.muted = !enabled
    button.classList.toggle('muted', !enabled)
    if (enabled) audio.play().catch(() => {})
  })
  win.requestAnimationFrame(draw)
}

function setupScrollControls(doc) {
  const win = doc.defaultView
  doc.querySelector('#scroll-top')?.addEventListener('click', event => {
    event.preventDefault()
    win.scrollTo({ top: 0, behavior: 'smooth' })
  })
  doc.querySelector('.scroll-to-cta')?.addEventListener('click', event => {
    event.preventDefault()
    doc.querySelector('#grid')?.scrollIntoView({ behavior: 'smooth' })
  })
}

export default function LegacySite() {
  const frameRef = useRef(null)

  const onLoad = event => {
    const frame = event.currentTarget
    const win = frame.contentWindow
    const doc = frame.contentDocument
    applySiteData(doc)
    win.setTimeout(() => applySiteData(doc), 150)
    win.setTimeout(() => applySiteData(doc), 800)
    setupAccordions(doc)
    setupCursor(doc)
    setupSound(doc)
    setupScrollControls(doc)
    win.focus()
  }

  useEffect(() => {
    const scrollInnerPage = amount => frameRef.current?.contentWindow?.scrollBy({ top: amount, behavior: 'auto' })
    const keyboard = event => {
      const steps = { ArrowDown: 120, ArrowUp: -120, PageDown: innerHeight * .85, PageUp: -innerHeight * .85, ' ': innerHeight * .85, Home: -100000, End: 100000 }
      if (steps[event.key] == null) return
      event.preventDefault()
      scrollInnerPage(steps[event.key])
    }
    window.addEventListener('keydown', keyboard)
    return () => {
      window.removeEventListener('keydown', keyboard)
    }
  }, [])

  return <iframe ref={frameRef} tabIndex="0" title={siteData.seo.title} onLoad={onLoad} src="/site/gspa/mont-fort.com/fort-energy/index.html" />
}
