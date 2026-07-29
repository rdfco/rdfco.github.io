export const navigationItems = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'knowing-fara', label: 'Knowing Fara', href: '/knowing-fara' },
  { key: 'solution', label: 'AI & Tech', href: '/solution' },
  { key: 'consulting', label: 'How we help', href: '/consulting' },
  { key: 'industries', label: 'Who we serve', href: '/industries' },
  { key: 'think-together', label: 'Think together', href: '/think-together' },
].map(item => ({ ...item, enabled: true, showInMenu: true }))

export const getNavigationItem = pathname =>
  navigationItems.find(item => item.href === pathname) || navigationItems[0]
