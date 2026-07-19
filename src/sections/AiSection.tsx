import { content } from '../data/content'
export function AiSection() { const ai = content.faraSections.ai; return <section id="consulting" className="fara-row fara-ai reveal"><header><h2>{ai.title}</h2><p>{ai.subtitle}</p></header><article className="fara-card is-static ai-copy"><p>{ai.text}</p></article></section> }
