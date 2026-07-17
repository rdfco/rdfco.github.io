import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LegacySite from './components/LegacySite'
import NativeApp from './native/NativeApp'
const nativePreviewEnabled=import.meta.env.VITE_ENABLE_NATIVE_PREVIEW==='true'||import.meta.env.DEV
const legacyRoutes=['/','/knowing-fara','/solution','/consulting','/industries','/case-studies','/think-together','/privacy-policy','/terms-of-use','/news','/news/:slug']
export default function App(){return <BrowserRouter><Routes>{legacyRoutes.map(path=><Route key={path} path={path} element={<LegacySite/>}/>) }<Route path="/native-preview" element={nativePreviewEnabled?<NativeApp/>:<Navigate to="/" replace/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></BrowserRouter>}
