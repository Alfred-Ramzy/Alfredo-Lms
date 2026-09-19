import { Outlet } from 'react-router-dom'

import { OfflineBanner } from '@/components/common/OfflineBanner'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <OfflineBanner />
      <Outlet />
    </ErrorBoundary>
  )
}

export default App
