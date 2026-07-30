const inquiryTypes = [
  'New or current client - I want to discuss new business opportunities and proposal requests (RFI or RFP).',
  'Job seeker - I have a question about job applications or working at FARA.',
  'Ecosystem partner - I want to explore ecosystem partnership opportunities with FARA.',
]

const fields = [
  { label: 'Name', required: true, type: 'text' },
  { label: 'Email address', required: true, type: 'email' },
  { label: 'Phone Number', required: true, type: 'tel' },
  { label: 'Company/Organization', required: true, type: 'text' },
  { label: 'Your role/function', required: false, type: 'text' },
]

const phoneIcon = document => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('aria-hidden', 'true')
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', 'M6.6 10.8c1.5 3 3.6 5.1 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1.3.4 2.6.6 4 .6.7 0 1.2.5 1.2 1.2v3.5c0 .7-.5 1.2-1.2 1.2C10.7 21.4 2.6 13.3 2.6 3.4c0-.7.5-1.2 1.2-1.2h3.5c.7 0 1.2.5 1.2 1.2 0 1.4.2 2.7.6 4 .1.4 0 .9-.3 1.2l-2.2 2.2Z')
  svg.append(path)
  return svg
}

const createField = (document, field) => {
  const label = document.createElement('label')
  label.className = 'fara-form-field'
  const span = document.createElement('span')
  span.textContent = `${field.label}${field.required ? '*' : ''}`
  const input = document.createElement('input')
  input.type = field.type
  input.name = field.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  input.required = field.required
  label.append(span, input)
  return label
}

const render = document => {
  const page = document.createElement('main')
  page.className = 'fara-route-page fara-think-page'
  page.dataset.faraPage = 'think-together'
  page.setAttribute('aria-label', 'Think together')
  const shell = document.createElement('div')
  shell.className = 'fara-page-shell fara-think-shell'
  const title = document.createElement('h1')
  title.textContent = "Let's Think Together"
  const form = document.createElement('form')
  form.className = 'fara-think-form'
  form.addEventListener('submit', event => event.preventDefault())

  const inquiry = document.createElement('fieldset')
  inquiry.className = 'fara-inquiry-fieldset'
  const legend = document.createElement('legend')
  legend.textContent = 'Inquiry Type*'
  inquiry.append(legend)
  inquiryTypes.forEach((type, index) => {
    const label = document.createElement('label')
    const input = document.createElement('input')
    input.type = 'radio'
    input.name = 'inquiry-type'
    input.required = true
    if (index === 0) input.checked = true
    const span = document.createElement('span')
    span.textContent = type
    label.append(input, span)
    inquiry.append(label)
  })

  const grid = document.createElement('div')
  grid.className = 'fara-form-grid'
  fields.forEach(field => grid.append(createField(document, field)))

  const message = document.createElement('label')
  message.className = 'fara-form-field fara-form-field--wide'
  const messageLabel = document.createElement('span')
  messageLabel.textContent = 'How can we help you?*'
  const textarea = document.createElement('textarea')
  textarea.name = 'message'
  textarea.required = true
  textarea.rows = 7
  message.append(messageLabel, textarea)

  const submit = document.createElement('button')
  submit.type = 'submit'
  submit.textContent = 'Submit'

  form.append(inquiry, grid, message, submit)

  const contact = document.createElement('aside')
  contact.className = 'fara-think-contact'
  const call = document.createElement('div')
  const callTitle = document.createElement('h2')
  callTitle.append(phoneIcon(document), document.createTextNode('Call us:'))
  const phone = document.createElement('p')
  phone.textContent = '0901 384 0313'
  call.append(callTitle, phone)
  const visit = document.createElement('div')
  const visitTitle = document.createElement('h2')
  visitTitle.textContent = 'Visit us:'
  const address = document.createElement('p')
  address.textContent = 'Tehran, Kargar St, Science And Technology Park, University of Tehran'
  visit.append(visitTitle, address)
  contact.append(call, visit)

  shell.append(title, form, contact)
  page.append(shell)
  return page
}

export const page = {
  data: { key: 'think-together', title: 'Think together', href: '/think-together' },
  render,
}
