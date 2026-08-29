export const navigationItems = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'who-we-are', label: 'Who we are', href: '/who-we-are' },
  { key: 'how-we-help', label: 'How we help', href: '/how-we-help' },
  { key: 'who-we-serve', label: 'Who we serve', href: '/who-we-serve' },
  { key: 'think-together', label: 'Think together', href: '/think-together' },
].map(item => ({ ...item, enabled: true, showInMenu: true }))

export const getNavigationItem = pathname => {
  const cleanPath = (pathname || '/').split('?')[0].replace(/\/+$/, '') || '/'
  return navigationItems.find(item => item.href === cleanPath) || navigationItems[0]
}
