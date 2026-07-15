import { SectionHeading } from '../components/ui/SectionHeading'
import { content } from '../data/content'
export function AboutSection(){return <section id="knowing-fara" className="section light about reveal"><SectionHeading eyebrow="ABOUT FARA">Intelligence.<br/>Innovation. Impact.</SectionHeading><p>{content.introduction.body}</p></section>}
