import { describe, expect, it } from 'vitest'
import { content, siteContentSchema } from '.'

describe('canonical site content', () => {
  it('validates the complete shared content source', () => {
    expect(siteContentSchema.safeParse(content).success).toBe(true)
    expect(content.faraSections.solutions).toHaveLength(3)
    expect(content.faraSections.industries).toHaveLength(5)
  })
})
