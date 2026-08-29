const themes = ['AI Strategy', 'Industrial Innovation', 'Digital Operations', 'Responsible Technology', 'Future Skills', 'Data Leadership', 'Smart Infrastructure']
const actions = ['creates measurable value', 'moves from pilot to scale', 'strengthens executive decisions', 'connects insight to action', 'builds resilient capabilities', 'accelerates responsible growth']

export const articles = Array.from({ length: 21 }, (_, index) => {
  const number = index + 1
  const theme = themes[index % themes.length]
  const action = actions[index % actions.length]
  return {
    id: number,
    slug: `fara-insight-${String(number).padStart(2, '0')}`,
    title: `${theme}: How FARA ${action}`,
    date: new Date(2026, 6 - Math.floor(index / 4), 17 - (index % 12)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    category: theme,
    mark: `F${String(number).padStart(2, '0')}`,
    summary: `A practical perspective on ${theme.toLowerCase()}, designed to help leaders convert emerging opportunities into focused programmes and lasting outcomes.`,
    lead: `FARA explores how organisations can apply ${theme.toLowerCase()} with clearer priorities, stronger governance, and an operating model built for delivery.`,
    sections: [
      { heading: 'From ambition to a working system', paragraphs: [`The strongest programmes begin with a shared definition of value. Teams connect business priorities to a limited set of decisions, experiments, and measurable outcomes.`, `This approach creates room for learning without losing accountability. Evidence is reviewed continuously and resources move toward the opportunities that demonstrate real potential.`] },
      { heading: 'Designing for adoption', paragraphs: [`Technology alone does not create transformation. Roles, incentives, skills, data, and day-to-day workflows must evolve together so that the new capability becomes part of normal operations.`, `FARA combines strategic direction with practical delivery patterns, helping teams move confidently from discovery through implementation and scale.`] },
      { heading: 'What leaders can do next', paragraphs: [`Start with one high-value decision, define the evidence required to improve it, and build a cross-functional team with the authority to act. Small, disciplined cycles create momentum while protecting long-term architectural choices.`] },
    ],
  }
})

export const getArticle = slug => articles.find(article => article.slug === slug)
