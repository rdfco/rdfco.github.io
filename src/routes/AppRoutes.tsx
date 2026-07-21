import { Navigate, Route, Routes } from 'react-router-dom'
import { appConfig } from '../config'
import { LegacyPage } from '../pages'

export function AppRoutes() {
  return <Routes>
    {appConfig.routes.legacy.map(path => (
      <Route key={path} path={path} element={<LegacyPage />} />
    ))}
    <Route path="*" element={<Navigate to={appConfig.routes.fallback} replace />} />
  </Routes>
}
