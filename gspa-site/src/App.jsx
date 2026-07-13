import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    window.location.replace('/fort-energy/')
  }, [])

  return null
}
