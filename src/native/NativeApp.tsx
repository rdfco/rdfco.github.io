import { lazy, Suspense, useRef } from 'react'
import { SkipLink } from '../components/accessibility/SkipLink'
import { SiteFooter } from '../components/SiteFooter'
import { content, footerOffices, legalLinks } from '../content'
import { HomeContent, useHomeRevealAnimations } from '../features/home'
import { NativeNavigation } from '../features/navigation'
import { sceneRegistry } from '../three'
import './native.css'
import './native-footer.css'

const FaraScene = lazy(sceneRegistry.fara.load)

export default function NativeApp() {
  const root = useRef<HTMLDivElement>(null)
  useHomeRevealAnimations(root)

  return <div className="native-app" ref={root}>
    <SkipLink />
    <NativeNavigation />
    <main id="main-content">
      <div className="scene-layer"><Suspense fallback={<div className="scene-fallback" aria-hidden="true" />}><FaraScene /></Suspense></div>
      <HomeContent />
    </main>
    <SiteFooter content={content} offices={footerOffices} legalLinks={legalLinks} />
  </div>
}
