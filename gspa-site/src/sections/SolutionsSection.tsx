import { CardGrid } from '../components/ui/CardGrid'
import { content } from '../data/content'
export function SolutionsSection() { return <section id="solution" className="fara-row fara-solutions reveal"><header><h2>By FARA</h2><p>Don’t just adapt to the future; Define it.</p></header><CardGrid items={content.faraSections.solutions} className="solutions-grid" /></section> }
