import { navigationItems } from '../navbar/navigation.js'

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
    title: 'FARA IS IN',
    subtitle: 'We Provide AI & Technology Consulting And Results-Oriented Solution.',
    nativeSubtitleLines: ['WE PROVIDE AI & TECHNOLOGY CONSULTING AND RESULTS-ORIENTED', 'SOLUTION.'],
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
    industries: [
      {
        title: 'Oil & Gas',
        text: "In oil and gas, innovation isn't a luxury—it's survival. Fara understands that. We combine deep tech expertise with a pragmatic ear for your real-world challenges, helping you turn global best practices into strategies that actually pay off—upstream, midstream, and downstream. But we don't stop at advice. We give you deployable tools and data insights that improve asset performance and streamline operations—without disrupting your business. For leaders tired of pilots that go nowhere, Fara is the partner who makes complexity work for you, not against you."
      },
      {
        title: 'Metal',
        text: 'In metals, the margin between leading and lagging is razor-thin. Fara gets that. We help you spot innovation opportunities others miss, modernize legacy processes, and adopt smart technologies that actually work on the shop floor—not just in theory. No dusty reports. Just deployable solutions and data-driven roadmaps that cut waste, lower energy costs, and improve yield.'
      },
      {
        title: 'Manufacture',
        text: 'In manufacturing, every second counts and every defect costs. Fara knows that. We help you uncover innovation opportunities hidden in your operations, modernize outdated processes, and adopt smart technologies that actually perform on the production line—not just in presentations. No theoretical fluff. Just practical solutions and data-backed roadmaps that boost throughput, reduce downtime, and improve quality.'
      },
      {
        title: 'Automotive',
        text: "In automotive, the race isn't just about speed—it's about staying relevant. Fara understands that. We help you navigate the convergence of electrification, software-defined vehicles, and autonomous driving—turning industry megatrends into practical roadmaps that actually drive value. From accelerating R&D cycles and streamlining supply chain complexity to integrating AI-driven quality systems on the production line, we deliver solutions that work in the real world, not just on the drawing board. Fara speaks your language—and helps you win the race that matters most."
      },
      {
        title: 'Health',
        text: "In healthcare, innovation isn't about being first; it’s about being right. FARA helps you harness the power of AI, data analytics, and digital health technologies to improve patient outcomes, streamline clinical workflows, and reduce operational burdens without compromising safety or trust. From predictive diagnostics and remote patient monitoring to intelligent scheduling and supply chain optimization, we deliver practical, deployable solutions. No cookie-cutter approaches. Just tailored strategies and transparent tools that enhance decision-making, shorten diagnosis times, and lower care delivery costs."
      }
    ]
  },
  sectionLabels: {
    industries: {
      title: 'Industries FARA Serves:',
      subtitle: 'FARA Industries'
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
      'استیل پاسارگاد',
      'کرمان موتور'
    ]
  }
}
