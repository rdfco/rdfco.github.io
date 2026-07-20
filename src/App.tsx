import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LegacySite from './components/LegacySite'
import { appConfig } from './config'
import NativeApp from './native/NativeApp'

export default function App() {
  return <BrowserRouter><Routes>
    {appConfig.routes.legacy.map(path => <Route key={path} path={path} element={<LegacySite />} />)}
    <Route
      path={appConfig.routes.nativePreview}
      element={appConfig.nativePreviewEnabled ? <NativeApp /> : <Navigate to={appConfig.routes.fallback} replace />}
    />
    <Route path="*" element={<Navigate to={appConfig.routes.fallback} replace />} />
  </Routes></BrowserRouter>
}
