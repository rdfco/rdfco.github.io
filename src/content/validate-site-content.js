const requiredText = (value, path, errors) => {
  if (typeof value !== 'string' || !value.trim()) errors.push(`${path} must be a non-empty string`)
}

export const validateSiteData = data => {
  const errors = []
  requiredText(data?.seo?.title, 'seo.title', errors)
  requiredText(data?.hero?.title, 'hero.title', errors)
  requiredText(data?.introduction?.title, 'introduction.title', errors)
  requiredText(data?.introduction?.body, 'introduction.body', errors)
  if (!Array.isArray(data?.navigation)) errors.push('navigation must be an array')
  if (!Array.isArray(data?.faraSections?.solutions)) errors.push('faraSections.solutions must be an array')
  if (!Array.isArray(data?.faraSections?.industries)) errors.push('faraSections.industries must be an array')
  if (!Array.isArray(data?.footer?.caseStudies)) errors.push('footer.caseStudies must be an array')
  if (!Array.isArray(data?.sectionOrder)) errors.push('sectionOrder must be an array')
  if (errors.length) throw new Error(`Invalid site data:\n- ${errors.join('\n- ')}`)
  return true
}
