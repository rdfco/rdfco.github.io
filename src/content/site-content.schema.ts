import { z } from 'zod'

export const cardSchema = z.object({ title: z.string().min(1), text: z.string().min(1) })
export const navigationItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  enabled: z.boolean(),
  showInMenu: z.boolean(),
  active: z.boolean().optional(),
})

export const siteContentSchema = z.object({
  seo: z.object({ title: z.string().min(1), description: z.string().min(1) }),
  brand: z.object({
    groupName: z.string().min(1),
    divisionName: z.string().min(1),
    logoText: z.string().min(1),
    desktopLogo: z.string(),
    mobileLogo: z.string(),
  }),
  navigation: z.array(navigationItemSchema).min(1),
  menuSettings: z.object({ enableLegalLinks: z.boolean() }),
  features: z.object({ sound: z.boolean() }),
  sectionOrder: z.array(z.enum(['about', 'solutions', 'ai', 'industries'])),
  sectionVisibility: z.record(z.string(), z.boolean()),
  hero: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    nativeSubtitleLines: z.tuple([z.string().min(1), z.string().min(1)]),
    scrollLabel: z.string(),
  }),
  uiLabels: z.object({
    menu: z.string().min(1),
    primaryNavigation: z.string().min(1),
    legalNavigation: z.string().min(1),
    loading: z.string().min(1),
    loadFailure: z.string().min(1),
  }),
  introduction: z.object({ title: z.string().min(1), body: z.string().min(1) }),
  advantage: z.object({
    title: z.string().min(1),
    lead: z.string().min(1),
    items: z.array(cardSchema).min(1),
  }),
  faraSections: z.object({
    solutions: z.array(cardSchema).min(1),
    ai: cardSchema.extend({ subtitle: z.string().min(1) }),
    industries: z.array(cardSchema).min(1),
  }),
  sectionLabels: z.object({
    industries: z.object({ title: z.string().min(1), subtitle: z.string().min(1) }),
  }),
  cta: z.object({ label: z.string().min(1), href: z.string().min(1) }),
  footer: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    copyright: z.string().min(1),
    caseStudies: z.array(z.string().min(1)),
  }),
})

export type SiteContent = z.infer<typeof siteContentSchema>
