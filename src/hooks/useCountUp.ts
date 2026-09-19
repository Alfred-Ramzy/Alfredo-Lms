import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const startedAt = performance.now()

    const tick = (current: number) => {
      const progress = Math.min((current - startedAt) / duration, 1)
      setValue(Math.round(target * progress))
      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    const frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [duration, target])

  return value
}
