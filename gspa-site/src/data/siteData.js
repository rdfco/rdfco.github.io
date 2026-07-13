export const siteData = {
  seo: { title: 'Fort Energy', description: 'Advancing Innovation in Energy Investments' },
  brand: {
    groupName: 'Montfort',
    divisionName: 'Fort Energy',
    logoText: 'FORT ENERGY',
    // فایل لوگو را داخل public/assets/logos بگذارید و مسیرش را اینجا بنویسید.
    // خالی بماند، لوگوی SVG اصلی سایت نمایش داده می‌شود.
    desktopLogo: '', // مثال: '/assets/logos/fort-energy-desktop.svg'
    mobileLogo: '',  // مثال: '/assets/logos/fort-energy-mobile.svg'
  },
  
  navigation: [
    { label: 'Montfort Group', href: '#' },
    { label: 'Montfort Trading', href: '#' },
    { label: 'Montfort Capital', href: '#' },
    { label: 'Montfort Maritime', href: '#' },
    { label: 'Fort Energy', href: '#hero', active: true }
  ],
  hero: { eyebrow: 'Montfort', title: 'FORT ENERGY', scrollLabel: 'Scroll down to discover' },
  introduction: {
    title: 'Advancing Innovation in Energy Investments',
    body: "As the dedicated investment division of the Montfort Group, Fort Energy supports Montfort's oil trading success through strategic expansions in the midstream and downstream sectors. Functioning as both an investor and an operator, Fort Energy invests in supply chain infrastructure and oil marketing businesses, enabling access to dynamic markets while creating a competitive advantage for its trading activity. Through well-identified strategies and a disciplined approach, Fort Energy invests in markets and businesses with high growth potential."
  },
  advantage: {
    title: 'The Fort Energy Advantage',
    lead: "The company's portfolio consists of six companies in the refining, storage, and distribution sectors.",
    items: [
      {
        title: 'Leadership driving growth and innovation',
        text: "Fort Energy's greatest strength lies in the synergy between its talented team and robust operating platform. The leadership team plays a pivotal role in managing a diverse portfolio of investments and companies, driving growth and innovation. With a shared vision, the team navigates the complexities of today's dynamic business landscape, guiding investments to flourish and sustain lasting returns."
      },
      {
        title: 'Strategic relationships',
        text: 'Fort Energy prioritizes relationship building within the downstream and other relevant sectors, while simultaneously exploring new partnerships and investment opportunities across the entire value chain.'
      },
      {
        title: 'Empowering communities through social responsibility',
        text: 'In addition to its business operations, Fort Energy is committed to empowering communities through initiatives that include alleviating poverty, supporting education, and empowering women, all in collaboration with local NGOs and non-profit organizations.'
      },
      {
        title: 'Preferential market access',
        text: "Courtesy of Montfort's wide net cast across geographies, Fort Energy is able to capitalize on opportunities to receive exclusive access to a diverse array of market opportunities and deal flow, allowing for a tactical advantage."
      },
      {
        title: 'Corporate governance and global compliance',
        text: 'Fort Energy operates under an integrated ESG management framework and adheres to strict corporate governance principles. Compliance with all relevant laws and regulations across global operations means that products are delivered responsibly and reliably, with health, safety, environmental, and social considerations taken into all activities.'
      }
    ]
  },
  cta: { label: 'Visit Fort Energy', href: 'https://www.fortenergy.com' },
  footer: { copyright: '(c) 2021 | Montfort - All rights reserved', offices: ['Geneva, Switzerland', 'Dubai, UAE', 'Singapore'] }
}
