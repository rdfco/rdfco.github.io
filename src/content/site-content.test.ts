import { describe, expect, it } from 'vitest'
import { content as compatibilityContent } from '../data/content'
import { content, siteContentSchema } from '.'

describe('canonical site content', () => {
  it('validates the complete shared content source', () => {
    expect(siteContentSchema.safeParse(content).success).toBe(true)
    expect(content.faraSections.solutions).toHaveLength(3)
    expect(content.faraSections.industries).toHaveLength(5)
  })

  it('keeps the M4 data adapter on the canonical object', () => {
    expect(compatibilityContent).toBe(content)
  })
})
