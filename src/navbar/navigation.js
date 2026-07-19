export const navigationItems = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'knowing-fara', label: 'Knowing FARA', href: '/knowing-fara' },
  { key: 'solution', label: 'Solution', href: '/solution' },
  { key: 'consulting', label: 'Consulting', href: '/consulting' },
  { key: 'industries', label: 'Industries', href: '/industries' },
  { key: 'case-studies', label: 'Case studies', href: '/case-studies' },
  { key: 'think-together', label: 'Think together', href: '/think-together' },
].map(item => ({ ...item, enabled: true, showInMenu: true }))

export const getNavigationItem = pathname =>
  navigationItems.find(item => item.href === pathname) || navigationItems[0]
