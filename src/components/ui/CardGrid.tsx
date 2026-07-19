import type { ContentCard as Card } from '../../types/content'
import { ContentCard } from './ContentCard'
export function CardGrid({ items, className = '' }: { items: Card[]; className?: string }) { return <div className={`fara-card-grid ${className}`}>{items.map((item, index) => <ContentCard key={item.title} item={item} index={index} />)}</div> }
