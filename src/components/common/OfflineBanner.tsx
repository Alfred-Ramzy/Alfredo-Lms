import { WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  if (online) return null

  return (
    <div className="fixed inset-x-4 top-4 z-[90] rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning shadow-soft">
      <WifiOff className="me-2 inline size-4" />
      You are offline. Some Firebase actions may retry when the connection returns.
    </div>
  )
}
