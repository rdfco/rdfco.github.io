import { CardGrid } from '../../components/ui/CardGrid'
import { content } from '../../content'

export function SolutionsSection() {
  return <section id="solution" className="fara-row fara-solutions reveal">
    <header><h2>By FARA</h2><p>Donâ€™t just adapt to the future; Define it.</p></header>
    <CardGrid items={content.faraSections.solutions} className="solutions-grid" />
  </section>
}
