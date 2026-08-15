import { Navigate, Route, Routes } from 'react-router-dom'
import { appConfig } from '../config'
import LegacySite from '../features/legacy-site/LegacySite'

export function AppRoutes() {
  return <Routes>
    <Route path="/knowing-fara" element={<Navigate to="/who-we-are" replace />} />
    <Route path="/consulting" element={<Navigate to="/how-we-help" replace />} />
    <Route path="/industries" element={<Navigate to="/who-we-serve" replace />} />
    {/* Preserved for future page reuse. The live navbar now scrolls these labels on the home page. */}
    <Route path="/who-we-are" element={<Navigate to="/" replace />} />
    <Route path="/how-we-help" element={<Navigate to="/" replace />} />
    <Route path="/who-we-serve" element={<Navigate to="/" replace />} />
    {appConfig.routes.legacy.map(path => (
      <Route key={path} path={path} element={<LegacySite />} />
    ))}
    <Route path="*" element={<Navigate to={appConfig.routes.fallback} replace />} />
  </Routes>
}
