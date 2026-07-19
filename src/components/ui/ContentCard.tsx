import type { ContentCard as Card } from '../../types/content'
export function ContentCard({ item }: { item: Card; index: number }) { return <article className="fara-card is-static">{item.title && <h3>{item.title}</h3>}<p>{item.text}</p></article> }
