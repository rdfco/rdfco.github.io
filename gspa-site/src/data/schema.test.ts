import { describe,expect,it } from 'vitest'
import { siteContentSchema } from './schema'
describe('site content contract',()=>{it('rejects incomplete content',()=>expect(siteContentSchema.safeParse({}).success).toBe(false))})
