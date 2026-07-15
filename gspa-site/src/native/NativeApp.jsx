import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { content } from '../data/content'
import { SkipLink } from '../components/accessibility/SkipLink'
import { AboutSection } from '../sections/AboutSection'
import { SolutionsSection } from '../sections/SolutionsSection'
import { AiSection } from '../sections/AiSection'
import { IndustriesSection } from '../sections/IndustriesSection'
import { CaseStudiesSection } from '../sections/CaseStudiesSection'
import './native.css'

const FaraScene = lazy(() => import('./FaraScene'))
gsap.registerPlugin(ScrollTrigger)
const navigation=content.navigation.map(item=>item.label)

function Header() {
  const [open, setOpen] = useState(false)
  return <>
    <header className="native-header">
      <a className="wordmark" href="#home">FARA</a>
      <nav aria-label="Primary">{navigation.map((item, index) => <a key={item} className={index ? 'muted' : ''} href={index ? `#${item.toLowerCase().replace(/\s/g, '-')}` : '#home'}>{item}</a>)}</nav>
      <button className="menu-button" onClick={() => setOpen(value => !value)} aria-expanded={open}>MENU <i /><i /></button>
    </header>
    <div className={`menu-panel ${open ? 'open' : ''}`} aria-hidden={!open}>{navigation.map(item => <a key={item} href="#home" onClick={() => setOpen(false)}>{item}</a>)}</div>
  </>
}

export default function NativeApp() {
  const root = useRef()
  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.utils.toArray('.reveal').forEach(element => gsap.from(element, { y: 55, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 84%' } }))
    }, root)
    return () => context.revert()
  }, [])

  return <div className="native-app" ref={root}>
    <SkipLink />
    <Header />
    <main id="main-content">
      <section id="home" className="native-hero">
        <div className="scene-layer"><Suspense fallback={null}><FaraScene /></Suspense></div>
        <div className="hero-copy"><h1>FARA IS IN</h1><p>WE PROVIDE AI &amp; TECHNOLOGY CONSULTING AND RESULTS-ORIENTED<br />SOLUTION.</p></div>
        <a className="scroll-cue" href="#knowing-fara">SCROLL TO DISCOVER</a>
      </section>
      <AboutSection/><SolutionsSection/><AiSection/><IndustriesSection/><CaseStudiesSection/>
    </main>
    <footer><strong>FARA</strong><span>© 2026 FARA — All rights reserved</span></footer>
  </div>
}
