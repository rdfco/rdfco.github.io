import { createPageComponent } from '../shared/page-component.js'
import { data } from './data.js'
import { renderSections } from './sections.js'
export const page = { data, render: document => createPageComponent(document, data, renderSections) }
