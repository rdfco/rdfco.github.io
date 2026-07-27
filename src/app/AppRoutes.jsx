import { Navigate, Route, Routes } from 'react-router-dom'
import { appConfig } from '../config'
import LegacySite from '../features/legacy-site/LegacySite'

export function AppRoutes() {
  return <Routes>
    {appConfig.routes.legacy.map(path => (
      <Route key={path} path={path} element={<LegacySite />} />
    ))}
    <Route path="*" element={<Navigate to={appConfig.routes.fallback} replace />} />
  </Routes>
}
