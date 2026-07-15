import { AdaptiveDpr,Preload } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { FaraLegacyScene } from '../scenes/fara/FaraLegacyScene'
export default function FaraScene(){return <Canvas camera={{fov:35,near:.1,far:1000}} dpr={[1,1.75]} gl={{antialias:true,powerPreference:'high-performance'}}><color attach="background" args={['#00111d']}/><fog attach="fog" args={['#00111d',40,450]}/><Suspense fallback={null}><FaraLegacyScene/><Preload all/></Suspense><AdaptiveDpr pixelated/></Canvas>}
