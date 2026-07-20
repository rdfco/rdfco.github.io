import { Navigate, Route, Routes } from 'react-router-dom'
import { appConfig } from '../config'
import { LegacyPage, NativePreviewPage } from '../pages'

export function AppRoutes() {
  return <Routes>
    {appConfig.routes.legacy.map(path => (
      <Route key={path} path={path} element={<LegacyPage />} />
    ))}
    <Route
      path={appConfig.routes.nativePreview}
      element={appConfig.nativePreviewEnabled
        ? <NativePreviewPage />
        : <Navigate to={appConfig.routes.fallback} replace />}
    />
    <Route path="*" element={<Navigate to={appConfig.routes.fallback} replace />} />
  </Routes>
}
