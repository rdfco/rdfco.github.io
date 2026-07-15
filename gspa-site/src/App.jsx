import LegacySite from './components/LegacySite'
import NativeApp from './native/NativeApp'

export default function App() {
  if (window.location.pathname.startsWith('/native-preview')) return <NativeApp />
  return <LegacySite />
}
