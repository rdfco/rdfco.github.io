import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SkipLink } from '../components/accessibility/SkipLink'
import { SiteFooter } from '../components/SiteFooter'
import { content } from '../content'
import { AboutSection } from '../sections/AboutSection'
import { AiSection } from '../sections/AiSection'
import { IndustriesSection } from '../sections/IndustriesSection'
import { SolutionsSection } from '../sections/SolutionsSection'
import './native.css'
import './native-footer.css'

const FaraScene = lazy(() => import('./FaraScene'))
gsap.registerPlugin(ScrollTrigger)

function Header() {
  const [open, setOpen] = useState(false)
  return <>
    <header className="native-header">
      <a className="wordmark" href="#home">{content.brand.logoText}</a>
      <nav aria-label={content.uiLabels.primaryNavigation}>{content.navigation.map((item, index) => <a key={item.label} className={index ? 'muted' : ''} href={item.href}>{item.label}</a>)}</nav>
      <button className="menu-button" type="button" onClick={() => setOpen(value => !value)} aria-controls="main-menu" aria-expanded={open}>{content.uiLabels.menu} <i /><i /></button>
    </header>
    <div id="main-menu" className={`menu-panel ${open ? 'open' : ''}`} aria-hidden={!open}>{content.navigation.map(item => <a key={item.label} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}</div>
  </>
}

export default function NativeApp() {
  const root = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!root.current) return
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.reveal').forEach(element => gsap.from(element, { y: 55, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 84%' } }))
    }, root)
    return () => context.revert()
  }, [])

  return <div className="native-app" ref={root}>
    <SkipLink />
    <Header />
    <main id="main-content">
      <div className="scene-layer"><Suspense fallback={<div className="scene-fallback" aria-hidden="true" />}><FaraScene /></Suspense></div>
      <section id="home" className="native-hero">
        <div className="hero-copy"><h1>{content.hero.title}</h1><p>{content.hero.nativeSubtitleLines[0]}<br />{content.hero.nativeSubtitleLines[1]}</p></div>
        <a className="scroll-cue" href="#knowing-fara">SCROLL TO DISCOVER</a>
      </section>
      <div id="grid" className="native-grid"><div className="fara-sections"><AboutSection /><SolutionsSection /><AiSection /><IndustriesSection /></div></div>
    </main>
    <SiteFooter />
  </div>
}
