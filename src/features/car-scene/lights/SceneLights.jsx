export function SceneLights({ config }) {
  return (
    <>
      <ambientLight intensity={config.ambient.intensity} />
      <directionalLight position={config.key.position} intensity={config.key.intensity} />
      <directionalLight position={config.fill.position} intensity={config.fill.intensity} />
    </>
  )
}
