import { assets, getAsset } from './asset-registry'

/**
 * Named, grouped access to every asset the site's own code loads.
 *
 * Code should reach for a name here rather than writing a URL, so that a typo
 * is a startup error instead of a missing image, and so that moving a file is
 * a change in one place. `assetUrl` resolves through the registry, which means
 * an id that does not exist throws the moment this module is imported.
 *
 * Assets the generated WebGL runtime addresses by URL are deliberately absent:
 * our code never loads them, and their paths are contracts we do not control.
 * `pinnedAssetPaths` lists them, derived from the registry rather than by hand.
 */
const assetUrl = (id: string): string => getAsset(id).path

export const brand = {
  favicon: assetUrl('brand-fara-favicon'),
  /** The white mark, used on the dark home hero. */
  markWhite: assetUrl('brand-fara-mark-white-svg'),
  markBlack: assetUrl('brand-fara-mark-black-svg'),
  markBlackRaster: assetUrl('brand-fara-mark-black-png'),
  /** The English wordmark in the footer. */
  wordmark: assetUrl('brand-fara-wordmark-black-png'),
} as const

export const icons = {
  inception: assetUrl('icon-inception'),
} as const

export const whoWeAreImages = {
  insiderIntelligence: assetUrl('who-we-are-insider-intelligence'),
  historyLight: assetUrl('who-we-are-history-light'),
  partners: {
    sharjah: assetUrl('who-we-are-partner-sharjah'),
    itonics: assetUrl('who-we-are-partner-itonics'),
    statista: assetUrl('who-we-are-partner-statista'),
    gartner: assetUrl('who-we-are-partner-gartner'),
    lensOrg: assetUrl('who-we-are-partner-lens-org'),
    trex: assetUrl('who-we-are-partner-trex'),
    lean: assetUrl('who-we-are-partner-lean'),
    alleantia: assetUrl('who-we-are-partner-alleantia'),
  },
} as const

export const whoWeServeImages = {
  businessSegmentation: assetUrl('who-we-serve-business-segmentation'),
  provenImpact: assetUrl('who-we-serve-proven-impact'),
} as const

/** Assets whose URL is a contract with the generated runtime. Read-only. */
export const pinnedAssetPaths: readonly string[] = assets
  .filter(asset => asset.placement === 'pinned')
  .map(asset => asset.path)
