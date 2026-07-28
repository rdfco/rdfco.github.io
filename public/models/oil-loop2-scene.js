/* global window */

const oilResourceKeys = ['oil', 'Oil']
const getHologramColor = key =>
  window.FARA_BACKGROUND_COLORS?.[key] ?? '#37b478'

// Tune these values only. The visible mesh is the Barrel mesh from Oil.glb.
const oilPlacement = {
  color: getHologramColor('hologram'),
  glowColor: getHologramColor('hologram'),
  scale: 0.42,
  offset: {
    x: 0.2,
    y: 0.1,
    z: -8,
  },
  rotation: {
    x: 1.0,
    y: 1.0,
    z: 1.0,
  },
}

const getOilScene = app => {
  const chapter =
    app.webgl?.pages?.FortEnergy?.chapters?.FortEnergyChapter
  const loadedModels =
    chapter?.assetsManager?.loaders?.models?.loadedAssets
  const resource = oilResourceKeys
    .map(key => loadedModels?.get?.(key))
    .find(Boolean)
  return resource?.scene ?? resource?.scenes?.[0] ?? resource
}

const getOilBarrel = app => getOilScene(app)?.getObjectByName?.('Barrel')

const vectorFrom = (Vector3, array, index) =>
  new Vector3(array[index * 3], array[index * 3 + 1], array[index * 3 + 2])

const vertexKey = vector =>
  `${vector.x.toFixed(5)},${vector.y.toFixed(5)},${vector.z.toFixed(5)}`

const createStructuralEdgeGeometry = (sourceGeometry, scratch) => {
  const position = sourceGeometry.attributes?.position
  if (!position?.array) return sourceGeometry

  const sourcePositions = position.array
  const sourceIndex = sourceGeometry.index?.array
  const faceCount = sourceIndex
    ? sourceIndex.length / 3
    : sourcePositions.length / 9
  const edges = new Map()
  const tempA = new scratch.Vector3()
  const tempB = new scratch.Vector3()
  const normal = new scratch.Vector3()

  for (let face = 0; face < faceCount; face += 1) {
    const indices = sourceIndex
      ? [
          sourceIndex[face * 3],
          sourceIndex[face * 3 + 1],
          sourceIndex[face * 3 + 2],
        ]
      : [face * 3, face * 3 + 1, face * 3 + 2]
    const points = indices.map(index =>
      vectorFrom(scratch.Vector3, sourcePositions, index),
    )
    normal
      .subVectors(points[1], points[0])
      .cross(tempA.subVectors(points[2], points[0]))
      .normalize()

    ;[[0, 1], [1, 2], [2, 0]].forEach(([start, end]) => {
      const startPoint = points[start]
      const endPoint = points[end]
      const startKey = vertexKey(startPoint)
      const endKey = vertexKey(endPoint)
      const key = startKey < endKey
        ? `${startKey}|${endKey}`
        : `${endKey}|${startKey}`
      const edge = edges.get(key)
      if (edge) {
        edge.normals.push(normal.clone())
      } else {
        edges.set(key, {
          start: startPoint.clone(),
          end: endPoint.clone(),
          normals: [normal.clone()],
        })
      }
    })
  }

  sourceGeometry.computeBoundingBox?.()
  const size = sourceGeometry.boundingBox
    ?.getSize(new scratch.Vector3())
  const thickness = Math.max(size?.x ?? 1, size?.y ?? 1, size?.z ?? 1) * 0.003
  const positions = []
  const sharpEdgeLimit = Math.cos(0.55)
  const fallback = new scratch.Vector3(0, 1, 0)
  const fallbackAlt = new scratch.Vector3(1, 0, 0)

  edges.forEach(edge => {
    const [firstNormal, secondNormal] = edge.normals
    if (secondNormal && firstNormal.dot(secondNormal) > sharpEdgeLimit) return

    const direction = tempA.subVectors(edge.end, edge.start).normalize()
    const side = tempB
      .crossVectors(direction, Math.abs(direction.y) > 0.9 ? fallbackAlt : fallback)
      .normalize()
      .multiplyScalar(thickness)
    const a = edge.start.clone().add(side)
    const b = edge.start.clone().sub(side)
    const c = edge.end.clone().add(side)
    const d = edge.end.clone().sub(side)
    positions.push(
      a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z,
      b.x, b.y, b.z, d.x, d.y, d.z, c.x, c.y, c.z,
    )
  })

  const Geometry = sourceGeometry.constructor
  const Attribute = position.constructor
  const geometry = new Geometry()
  geometry.setAttribute(
    'position',
    new Attribute(new Float32Array(positions), 3),
  )
  return geometry
}

const createOilFadeProxy = referenceMaterial => ({
  uniforms: {
    uFade: {
      value: referenceMaterial.uniforms?.uFade?.value ?? 0,
    },
  },
})

const syncOilFade = (object, fadeProxy) => {
  const fade = fadeProxy.uniforms.uFade.value
  object.visible = true
  if (object.material) object.material.opacity = fade * 0.85
}

const createOilMaterial = (sourceMaterial, {
  color = oilPlacement.color,
  opacity = 1,
  wireframe = true,
} = {}) => {
  const Material = sourceMaterial.constructor
  const material = new Material({
    color,
    wireframe,
    transparent: true,
    opacity,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  })

  material.side = 2
  material.blending = 2
  if (material.color?.set) material.color.set(color)
  if (material.emissive?.set) material.emissive.set(color)
  if ('emissiveIntensity' in material) material.emissiveIntensity = wireframe ? 2 : 3
  material.needsUpdate = true
  return material
}

const adaptOilMaterial = sourceMaterial =>
  createOilMaterial(sourceMaterial, { wireframe: false })

const fitOilToTarget = (oil, target, scratch) => {
  oil.updateWorldMatrix(true, true)
  target.updateWorldMatrix(true, true)

  const targetBox = new scratch.Box3().setFromObject(target)
  const oilBox = new scratch.Box3().setFromObject(oil)
  const targetSize = targetBox.getSize(new scratch.Vector3())
  const oilSize = oilBox.getSize(new scratch.Vector3())
  const targetMax = Math.max(targetSize.x, targetSize.y, targetSize.z)
  const oilMax = Math.max(oilSize.x, oilSize.y, oilSize.z)

  if (targetMax > 0 && oilMax > 0) {
    oil.scale.multiplyScalar(targetMax / oilMax)
    oil.updateWorldMatrix(true, true)
  }

  const targetCenter = targetBox.getCenter(new scratch.Vector3())
  const oilCenter = new scratch.Box3()
    .setFromObject(oil)
    .getCenter(new scratch.Vector3())
  const parent = oil.parent
  if (parent?.worldToLocal) {
    oil.position.add(
      parent.worldToLocal(targetCenter.clone()).sub(
        parent.worldToLocal(oilCenter.clone()),
      ),
    )
  } else {
    oil.position.add(targetCenter.sub(oilCenter))
  }
}

const applyOilPlacement = oil => {
  oil.scale.multiplyScalar(oilPlacement.scale)
  oil.rotation.x += oilPlacement.rotation.x
  oil.rotation.y += oilPlacement.rotation.y
  oil.rotation.z += oilPlacement.rotation.z
  oil.position.x += oilPlacement.offset.x
  oil.position.y += oilPlacement.offset.y
  oil.position.z += oilPlacement.offset.z
}

const syncOilToCameraFrame = ({ app, oil, targetCenter, scratch }) => {
  const renderCamera = app.webgl.camera
  const sourceCamera = app.webgl.camera.tertiaryCamera
  if (!renderCamera || !sourceCamera) return

  sourceCamera.updateMatrixWorld(true)
  sourceCamera.updateProjectionMatrix()
  renderCamera.updateMatrixWorld(true)
  renderCamera.updateProjectionMatrix()

  const projected = targetCenter.clone().project(sourceCamera)
  const framed = new scratch.Vector3(
    projected.x + oilPlacement.offset.x,
    projected.y + oilPlacement.offset.y,
    0.92,
  ).unproject(renderCamera)
  const direction = framed
    .clone()
    .sub(renderCamera.getWorldPosition(new scratch.Vector3()))
    .normalize()
  const worldPosition = renderCamera
    .getWorldPosition(new scratch.Vector3())
    .add(direction.multiplyScalar(Math.abs(oilPlacement.offset.z)))

  if (oil.parent?.worldToLocal) {
    oil.position.copy(oil.parent.worldToLocal(worldPosition))
  } else {
    oil.position.copy(worldPosition)
  }
}

const lockOilScreenScale = ({ app, barrel, state, scratch }) => {
  const camera = app.webgl.camera
  if (!camera) return

  barrel.updateWorldMatrix(true, true)
  camera.updateMatrixWorld(true)

  const center = new scratch.Box3()
    .setFromObject(barrel)
    .getCenter(new scratch.Vector3())
  const distance = camera
    .getWorldPosition(new scratch.Vector3())
    .distanceTo(center)

  if (!state.distance) {
    state.distance = distance
    state.scale = barrel.scale.clone()
  }

  if (!state.distance || distance <= 0) return
  barrel.scale.copy(state.scale).multiplyScalar(distance / state.distance)
}

export const replaceFirstLoop2ModelWithOil = ({
  app,
  holograms,
}) => {
  const oldModel = holograms[0]
  const oilSource = getOilBarrel(app)
  if (!oldModel || !oilSource?.clone) return null

  const oldParent = oldModel.parent
  if (!oldParent) return null

  oldModel.geometry?.computeBoundingBox()
  const scratch = {
    Box3: oldModel.geometry.boundingBox.constructor,
    Vector3: oldModel.position.constructor,
  }
  oldModel.updateWorldMatrix(true, true)
  const targetCenter = new scratch.Box3()
    .setFromObject(oldModel)
    .getCenter(new scratch.Vector3())
  const screenScaleState = {
    distance: 0,
    scale: null,
  }

  const oil = new oldParent.constructor()
  oil.name = 'Loop2OilModel'
  oil.position.copy(oldModel.position)
  oil.quaternion.copy(oldModel.quaternion)
  oil.scale.copy(oldModel.scale)

  const fadeProxy = createOilFadeProxy(oldModel.material)
  oil.material = fadeProxy

  const barrel = oilSource.clone(true)
  barrel.name = 'Barrel'
  barrel.position.set(0, 0, 0)
  barrel.rotation.set(0, 0, 0)
  barrel.scale.set(1, 1, 1)
  barrel.geometry = createStructuralEdgeGeometry(barrel.geometry, scratch)
  barrel.layers.mask = oldModel.layers.mask
  barrel.material = adaptOilMaterial(barrel.material)
  barrel.frustumCulled = false
  barrel.renderOrder = 10
  barrel.onBeforeRender = () => {
    syncOilToCameraFrame({ app, oil, targetCenter, scratch })
    lockOilScreenScale({
      app,
      barrel,
      state: screenScaleState,
      scratch,
    })
    syncOilFade(barrel, fadeProxy)
  }
  syncOilFade(barrel, fadeProxy)
  oil.add(barrel)

  oldParent.add(oil)
  fitOilToTarget(oil, oldModel, scratch)
  applyOilPlacement(oil)
  oldModel.removeFromParent()

  return oil
}
