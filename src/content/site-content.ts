import { siteData } from './site-data.js'
import { siteContentSchema } from './site-content.schema'

export const content = siteContentSchema.parse(siteData)
