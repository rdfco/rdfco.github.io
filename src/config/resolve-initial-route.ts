import { matchPath } from 'react-router-dom'
import { appConfig } from './app-config'

const MAX_HOPS = 8

/**
 * The path the router will settle on for `pathname`, without rendering anything.
 *
 * index.html ships the shell markup so the first paint is the loader rather
 * than a white page, and main.jsx hydrates onto it. A route that renders a
 * redirect instead of the shell has nothing for React to hydrate against, so
 * the pre-rendered shell is left in the document and the real one is mounted
 * beside it - two shells, the stale one on top, its loading gate never lifting.
 *
 * Following the redirects here, before hydration, means the first render is
 * always the shell the markup already describes.
 */
export const resolveInitialRoute = (pathname: string): string => {
  let current = pathname || '/'
  for (let hop = 0; hop < MAX_HOPS; hop += 1) {
    const redirect: string | undefined = (appConfig.routes.redirects as Record<string, string>)[current]
    if (redirect) {
      current = redirect
      continue
    }
    const isLegacyRoute = appConfig.routes.legacy.some(pattern => matchPath(pattern, current))
    return isLegacyRoute ? current : appConfig.routes.fallback
  }
  return appConfig.routes.fallback
}
