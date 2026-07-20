import { CatmullRomCurve3, Mesh, Object3D, Vector3 } from 'three'

export type SceneCurve = CatmullRomCurve3 | null

function curveFromPoints(points: Vector3[]): SceneCurve {
  return points.length > 1
    ? new CatmullRomCurve3(points, false, 'centripetal')
    : null
}

export function curveFromMesh(root: Object3D, name: string): SceneCurve {
  const mesh = root.getObjectByName(name) as Mesh | undefined
  const positions = mesh?.geometry?.attributes.position

  if (!mesh || !positions) return null

  mesh.updateWorldMatrix(true, false)
  const points: Vector3[] = []
  for (let index = 0; index < positions.count; index += 1) {
    points.push(
      mesh.localToWorld(new Vector3().fromBufferAttribute(positions, index)),
    )
  }
  return curveFromPoints(points)
}

export function curveFromNamedPoints(
  root: Object3D,
  prefix: string,
): SceneCurve {
  const points = root.children
    .filter((node) => node.name.startsWith(prefix))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    .map((node) => node.getWorldPosition(new Vector3()))

  return curveFromPoints(points)
}
