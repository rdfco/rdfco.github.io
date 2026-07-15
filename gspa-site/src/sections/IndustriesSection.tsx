import { CardGrid } from '../components/ui/CardGrid'
import { content } from '../data/content'
export function IndustriesSection() { return <section id="industries" className="fara-row fara-industries reveal"><header><h2>Industries FARA Serves:</h2><p>FARA Industries</p></header><CardGrid items={content.faraSections.industries} className="industries-grid" /></section> }
