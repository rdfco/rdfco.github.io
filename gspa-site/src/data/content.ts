import { siteData } from './siteData.js'
import { siteContentSchema } from './schema'
export const content = siteContentSchema.parse(siteData)
