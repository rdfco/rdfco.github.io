import { Canvas, useFrame } from '@react-three/fiber'
import { AdaptiveDpr, Preload } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function LightRoad() {
  const group = useRef()
  const stars = useMemo(() => {
    const points = new Float32Array(900 * 3)
    for (let i = 0; i < 900; i += 1) {
      points[i * 3] = (Math.random() - 0.5) * 34
      points[i * 3 + 1] = Math.random() * 17 - 2
      points[i * 3 + 2] = -Math.random() * 30
    }
    return points
  }, [])
  const lanes = useMemo(() => Array.from({ length: 72 }, (_, index) => {
    const x = (index - 35.5) * 0.2
    return { x, end: x * 7.5 }
  }), [])

  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * 0.18) * 0.006
  })

  return (
    <group ref={group}>
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[stars, 3]} /></bufferGeometry>
        <pointsMaterial color="#5bd9ff" size={0.035} transparent opacity={0.8} sizeAttenuation />
      </points>
      {lanes.map(({ x, end }, index) => {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(x * 0.12, -0.2, -12),
          new THREE.Vector3(x * 0.2, -0.5, -8),
          new THREE.Vector3(x, -1.2, -3),
          new THREE.Vector3(end, -2.8, 7),
        ])
        return (
          <mesh key={index}>
            <tubeGeometry args={[curve, 32, index % 5 === 0 ? 0.015 : 0.006, 3, false]} />
            <meshBasicMaterial color={index % 5 === 0 ? '#50dcff' : '#168ec8'} transparent opacity={index % 5 === 0 ? 0.9 : 0.42} />
          </mesh>
        )
      })}
      <mesh position={[0, 0.5, -11]}>
        <coneGeometry args={[4.2, 11, 80, 1, true]} />
        <meshBasicMaterial color="#20bfff" wireframe transparent opacity={0.14} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export default function FaraScene() {
  return (
    <Canvas camera={{ position: [0, 1.2, 8], fov: 53 }} dpr={[1, 1.75]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <color attach="background" args={['#00111d']} />
      <fog attach="fog" args={['#00111d', 8, 32]} />
      <LightRoad />
      <AdaptiveDpr pixelated />
      <Preload all />
    </Canvas>
  )
}
