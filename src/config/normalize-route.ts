// One definition of what counts as the same route, shared by the parent shell
// and the legacy runtime: a trailing slash is not a different page, but a query
// string is. Both sides compare routes, so both have to agree on this.
export const normalizeRoute = (value: string): string => {
  if (!value) return value
  const [path, query = ''] = String(value).split('?')
  const normalizedPath = path === '/' ? '/' : path.replace(/\/+$/, '')
  return query ? `${normalizedPath}?${query}` : normalizedPath
}
