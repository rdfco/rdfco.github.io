import { content } from '../../content'
import { AboutSection } from './AboutSection'
import { AiSection } from './AiSection'
import { IndustriesSection } from './IndustriesSection'
import { SolutionsSection } from './SolutionsSection'

export function HomeContent() {
  return <>
    <section id="home" className="native-hero">
      <div className="hero-copy">
        <h1>{content.hero.title}</h1>
        <p>{content.hero.nativeSubtitleLines[0]}<br />{content.hero.nativeSubtitleLines[1]}</p>
      </div>
      <a className="scroll-cue" href="#knowing-fara">SCROLL TO DISCOVER</a>
    </section>
    <div id="grid" className="native-grid">
      <div className="fara-sections">
        <AboutSection /><SolutionsSection /><AiSection /><IndustriesSection />
      </div>
    </div>
  </>
}
