import type { ContentCard as Card } from '../../types/content'
export function ContentCard({item,index}:{item:Card;index:number}){return <article className="fara-card"><span>{String(index+1).padStart(2,'0')}</span><h3>{item.title}</h3><p>{item.text}</p></article>}
