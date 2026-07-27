import { BrowserRouter } from 'react-router-dom'
import AppErrorBoundary from './AppErrorBoundary'
import { AppRoutes } from './AppRoutes'

export function App() {
  return <AppErrorBoundary>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AppErrorBoundary>
}
