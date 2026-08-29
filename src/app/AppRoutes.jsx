import { Navigate, Route, Routes } from 'react-router-dom'
import { appConfig } from '../config'
import LegacySite from '../features/legacy-site/LegacySite'

export function AppRoutes() {
  return <Routes>
    {/* Older public URLs, plus the three section labels the navbar now scrolls
        to on the home page. A deep link to one of these is resolved before
        hydration; these routes cover navigation that happens after it. */}
    {Object.entries(appConfig.routes.redirects).map(([from, to]) => (
      <Route key={from} path={from} element={<Navigate to={to} replace />} />
    ))}
    {appConfig.routes.legacy.map(path => (
      <Route key={path} path={path} element={<LegacySite />} />
    ))}
    <Route path="*" element={<Navigate to={appConfig.routes.fallback} replace />} />
  </Routes>
}
