import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { caseStudies, industries, navigation, solutions } from './data'
import './native.css'

const FaraScene = lazy(() => import('./FaraScene'))
gsap.registerPlugin(ScrollTrigger)

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

function CardGrid({ items, className = '' }) {
  return <div className={`card-grid ${className}`}>{items.map((item, index) => <article className="fara-card" key={item.title}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
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
    <Header />
    <main>
      <section id="home" className="native-hero">
        <div className="scene-layer"><Suspense fallback={null}><FaraScene /></Suspense></div>
        <div className="hero-copy"><h1>FARA IS IN</h1><p>WE PROVIDE AI &amp; TECHNOLOGY CONSULTING AND RESULTS-ORIENTED<br />SOLUTION.</p></div>
        <a className="scroll-cue" href="#knowing-fara">SCROLL TO DISCOVER</a>
      </section>
      <section id="knowing-fara" className="section light about reveal"><div className="eyebrow">ABOUT FARA</div><h2>Intelligence.<br />Innovation. Impact.</h2><p>We are a consulting firm specializing in Technology and Innovation Management. We integrate artificial intelligence into everything we do—from opportunity scouting and product development to capability building.</p></section>
      <section id="solution" className="section navy reveal"><div className="eyebrow">SOLUTIONS BY FARA</div><h2>Don’t just adapt to the future;<br />Define it.</h2><CardGrid items={solutions} /></section>
      <section id="consulting" className="section cyan reveal"><div className="split"><div><div className="eyebrow">AI BY FARA</div><h2>Smarter with AI.<br />Better with Human.</h2></div><p>We help organizations identify which technologies solve real business problems. From generative AI and computer vision to predictive analytics and automation, we design practical solutions that integrate with existing systems.</p></div></section>
      <section id="industries" className="section dark reveal"><div className="eyebrow">FARA INDUSTRIES</div><h2>Industries FARA Serves:</h2><CardGrid items={industries} className="industries" /></section>
      <section id="case-studies" className="section cases reveal"><div className="eyebrow">PROVEN IMPACT</div><h2>FARA Case Studies</h2><div className="case-list">{caseStudies.map((item, index) => <div key={item}><span>0{index + 1}</span><strong>{item}</strong><b>↗</b></div>)}</div></section>
    </main>
    <footer><strong>FARA</strong><span>© 2026 FARA — All rights reserved</span></footer>
  </div>
}
