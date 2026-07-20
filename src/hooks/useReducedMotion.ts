import { useEffect, useState } from 'react'

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

function currentPreference() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(reducedMotionQuery).matches
  )
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(currentPreference)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const media = window.matchMedia(reducedMotionQuery)
    const update = () => setReduced(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reduced
}
