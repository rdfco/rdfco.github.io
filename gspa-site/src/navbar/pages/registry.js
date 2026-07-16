import { page as home } from './home/component.js'
import { page as knowingFara } from './knowing-fara/component.js'
import { page as solution } from './solution/component.js'
import { page as consulting } from './consulting/component.js'
import { page as industries } from './industries/component.js'
import { page as caseStudies } from './case-studies/component.js'
import { page as thinkTogether } from './think-together/component.js'

export const pages = { home, 'knowing-fara': knowingFara, solution, consulting, industries, 'case-studies': caseStudies, 'think-together': thinkTogether }
export const getPage = key => pages[key] || pages.home
