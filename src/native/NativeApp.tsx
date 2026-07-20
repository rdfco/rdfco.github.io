import { lazy, Suspense, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SkipLink } from '../components/accessibility/SkipLink'
import { SiteFooter } from '../components/SiteFooter'
import { HomeContent } from '../features/home'
import { NativeNavigation } from '../features/navigation'
import './native.css'
import './native-footer.css'

const FaraScene = lazy(() => import('./FaraScene'))
gsap.registerPlugin(ScrollTrigger)

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
    <NativeNavigation />
    <main id="main-content">
      <div className="scene-layer"><Suspense fallback={<div className="scene-fallback" aria-hidden="true" />}><FaraScene /></Suspense></div>
      <HomeContent />
    </main>
    <SiteFooter />
  </div>
}
