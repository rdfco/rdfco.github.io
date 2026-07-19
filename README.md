# FARA website

Vite project using React, Tailwind CSS, JavaScript, and GSAP. The mirrored 3D/GSAP shell is preserved, while FARA content is rendered from one central data file and small feature modules.

## Start the site

```bash
npm install
npm run dev
```

Production check:

```bash
npm run check
```

## Edit content

All frequently edited content lives in `src/data/siteData.js`:

- `seo`: browser title and description.
- `brand`: text label and optional desktop/mobile logo files.
- `navigation`: menu labels, active state, click state, and overlay visibility.
- `hero`: hero title, subtitle, and scroll label.
- `introduction`: About title/body and optional media.
- `faraSections.solutions`: service cards.
- `faraSections.ai`: AI section.
- `faraSections.industries`: expandable industry cards.
- `sectionOrder`: order of the four main sections.
- `sectionVisibility`: show/hide a full section.
- `footer`: heading, company list, and copyright.

### Add or remove an item

Add/remove/reorder objects inside an array. The renderer recalculates the DOM and grid automatically. An item may be temporarily hidden with `enabled: false`.

```js
{
  title: 'New industry',
  text: 'Description shown in the expandable card.',
  enabled: true,
  media: {
    src: '/assets/images/new-industry.webp',
    alt: 'Accessible image description'
  }
}
```

Footer entries can remain simple strings or use objects:

```js
{ name: 'Company name', direction: 'rtl', enabled: true }
```

### Change the logo

Put files in `public/assets/logos/`, then set:

```js
brand: {
  desktopLogo: '/assets/logos/fara-desktop.svg',
  mobileLogo: '/assets/logos/fara-mobile.svg'
}
```

Keep both values empty to preserve the current text hero.

## Edit styles

`src/custom.css` is only the ordered stylesheet entry point. Edit the relevant file:

- `src/styles/navigation.css`
- `src/styles/hero.css`
- `src/styles/sections.css`
- `src/styles/cards.css`
- `src/styles/industries.css`
- `src/styles/footer.css`
- `src/styles/responsive.css`

The import order in `custom.css` is intentional. Tailwind remains configured for React/JSX components in `src/**/*.{js,jsx}`.

## JavaScript structure

- `src/site-customizer.js`: small bootstrap only.
- `src/js/apply-site.js`: coordinates a full render.
- `src/js/navigation.js`: navigation cloning and states.
- `src/js/components/`: Hero, sections, cards, and footer.
- `src/js/core/`: shared DOM utilities.
- `src/data/validateSiteData.js`: catches missing required content early.

## Visual regression contract

The reference is stored in `work/baseline/`. To capture a candidate and compare it:

```powershell
$env:BASELINE_DIR='work/after'; npm run visual:baseline
npm run visual:compare
```

The comparison checks visible text, item counts, section positions/sizes, computed styles, page height, browser errors, and horizontal overflow at desktop, tablet, and mobile widths.
