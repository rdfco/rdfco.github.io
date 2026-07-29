import { navigationItems } from '../navbar/navigation.js'
import heroContent from './hero.json' with { type: 'json' }
import industriesContent from './industries.json' with { type: 'json' }

export const siteData = {
  seo: { title: 'FARA', description: 'AI, technology and innovation consulting' },
  brand: {
    groupName: 'FARA',
    divisionName: 'FARA',
    logoText: 'FARA',
    // فایل لوگو را داخل public/assets/logos بگذارید و مسیرش را اینجا بنویسید.
    // خالی بماند، لوگوی SVG اصلی سایت نمایش داده می‌شود.
    desktopLogo: '', // مثال: '/assets/logos/fort-energy-desktop.svg'
    mobileLogo: '',  // مثال: '/assets/logos/fort-energy-mobile.svg'
  },

  navigation: navigationItems,
  menuSettings: {
    enableLegalLinks: true
  },
  features: {
    // Keep the legacy audio asset/runtime available for the final launch.
    // Switch this back to true when the site soundtrack is ready to return.
    sound: false,
  },
  sectionOrder: ['about', 'solutions', 'ai', 'industries'],
  sectionVisibility: {
    about: true,
    solutions: true,
    ai: true,
    industries: true
  },
  hero: {
    title: `${heroContent.staticPrefix} ${heroContent.items[0]}`,
    staticPrefix: heroContent.staticPrefix,
    items: heroContent.items,
    subtitle: heroContent.subtitle,
    scrollLabel: '',
  },
  uiLabels: {
    menu: 'MENU',
    primaryNavigation: 'Primary',
    legalNavigation: 'Legal',
    loading: 'Loading FARA',
    loadFailure: 'FARA could not be loaded. Please refresh the page.',
  },
  introduction: {
    title: 'ABOUT FARA\nIntelligence. Innovation. Impact.',
    body: "We are a consulting firm specializing in Technology and Innovation Management. Our edge? We integrate artificial intelligence into everything we do—from opportunity scouting and product development to capability building. By combining AI-powered analytics with deep industry expertise and international standards, we help you cut through complexity, seize high-value opportunities, and future-proof your organization. At FARA, we don't just talk about AI—we put it to work for you."
  },
  advantage: {
    title: 'By FARA',
    lead: "Don’t just adapt to the future; Define it.",
    items: [
      {
        title: 'Technology and innovation strategy',
        text: 'FARA turns technology signals and business priorities into practical innovation roadmaps with clear outcomes, ownership, and measurable value.'
      },
      {
        title: 'AI-enabled decision making',
        text: 'We combine human expertise with AI-powered analytics to identify opportunities, reduce uncertainty, and support faster strategic decisions.'
      },
      {
        title: 'Deployable solutions',
        text: 'Our work moves beyond presentations into tools, pilots, and operating solutions designed to integrate with real organizational processes.'
      },
      {
        title: 'Industry-focused expertise',
        text: 'FARA adapts global methods to the operational realities of energy, metals, manufacturing, automotive, and healthcare organizations.'
      },
      {
        title: 'Capability that lasts',
        text: 'We build internal skills, governance, and repeatable systems so innovation and digital transformation continue after each engagement ends.'
      }
    ]
  },
  faraSections: {
    solutions: [
      {
        title: 'Inception',
        text: 'INCEPTION by FARA delivers technology and innovation management services, supporting organizations in identifying opportunities, developing new products, and building robust innovation systems.'
      },
      {
        title: 'Infinity',
        text: 'INFINITY by FARA focuses on digital transformation and smart enablement, helping organizations streamline, digitize, and optimize their processes.'
      },
      {
        title: 'Insight',
        text: 'INSIGHT by FARA provides technology data analytics—turning trends, patents, and market signals into actionable insights for strategic decision-making in technology and R&D.'
      }
    ],
    ai: {
      title: 'AI by FARA',
      subtitle: 'Smarter with AI. Better with Human',
      text: 'In the world of AI and emerging tech, speed to value is everything. Fara lives and breathes that. We help you cut through the hype and identify which technologies actually solve real business problems—not which ones look good on a slide. From generative AI and computer vision to predictive analytics and automation, we design practical, deployable solutions that integrate with your existing systems, not replace them overnight. No black-box promises.'
    },
    industries: industriesContent.items.map(item => ({
      title: item.title,
      text: item.body,
      buttonText: industriesContent.buttonText,
    }))
  },
  sectionLabels: {
    industries: {
      title: industriesContent.title,
      subtitle: industriesContent.subtitle,
      description: industriesContent.description
    }
  },
  cta: { label: 'Work with FARA', href: '#footer' },
  footer: {
    eyebrow: 'Proven Impact',
    title: 'FARA Case Studies',
    copyright: '© 2026 | FARA - All rights reserved',
    caseStudies: [
      'پتروشیمی مارون / پتروشیمی بندر امام',
      'توسعه آهن و فولاد گل‌گهر',
      'ایرانسل',
      'کرمان موتور',
      'انستیتو پاستور'
    ]
  }
}
