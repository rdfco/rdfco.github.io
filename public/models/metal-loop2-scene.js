const metalResourceKeys = ['metal', 'Metal', 'metals', 'Metals']
const metalTargetIndex = 1

const getHologramColor = key =>
  window.FARA_BACKGROUND_COLORS?.[key] ?? '#37b478'

const metalPlacement = {
  color: getHologramColor('hologram'),
  glowColor: getHologramColor('hologram'),
  scale: 0.42,
  offset: {
    x: 0,
    y: 0,
    z: -8,
  },
  rotation: {
    x: 1.0,
    y: 1.0,
    z: 0.2,
  },
}

const getMetalScene = app => {
  const chapter =
    app.webgl?.pages?.FortEnergy?.chapters?.FortEnergyChapter
  const loadedModels =
    chapter?.assetsManager?.loaders?.models?.loadedAssets
  const resource = metalResourceKeys
    .map(key => loadedModels?.get?.(key))
    .find(Boolean)
  return resource?.scene ?? resource?.scenes?.[0] ?? resource
}

const getMetalMesh = app => getMetalScene(app)?.getObjectByName?.('metal')

const vectorFrom = (Vector3, array, index) =>
  new Vector3(array[index * 3], array[index * 3 + 1], array[index * 3 + 2])

const vertexKey = vector =>
  `${vector.x.toFixed(5)},${vector.y.toFixed(5)},${vector.z.toFixed(5)}`

const createStructuralEdgeGeometry = (sourceGeometry, scratch) => {
  const position = sourceGeometry.attributes?.position
  if (!position?.array) return sourceGeometry

  const sourcePositions = position.array
  const sourceIndex = sourceGeometry.index?.array
  const faceCount = sourceIndex ? sourceIndex.length / 3 : sourcePositions.length / 9
  const edges = new Map()
  const tempA = new scratch.Vector3()
  const tempB = new scratch.Vector3()
  const normal = new scratch.Vector3()

  for (let face = 0; face < faceCount; face += 1) {
    const indices = sourceIndex
      ? [sourceIndex[face * 3], sourceIndex[face * 3 + 1], sourceIndex[face * 3 + 2]]
      : [face * 3, face * 3 + 1, face * 3 + 2]
    const points = indices.map(index => vectorFrom(scratch.Vector3, sourcePositions, index))
    normal.subVectors(points[1], points[0]).cross(tempA.subVectors(points[2], points[0])).normalize()

    ;[[0, 1], [1, 2], [2, 0]].forEach(([start, end]) => {
      const startPoint = points[start]
      const endPoint = points[end]
      const startKey = vertexKey(startPoint)
      const endKey = vertexKey(endPoint)
      const key = startKey < endKey ? `${startKey}|${endKey}` : `${endKey}|${startKey}`
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
  const size = sourceGeometry.boundingBox?.getSize(new scratch.Vector3())
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
  geometry.setAttribute('position', new Attribute(new Float32Array(positions), 3))
  return geometry
}

const createMetalTimelineProxy = referenceMaterial => ({
  uniforms: {
    uFade: {
      value: referenceMaterial.uniforms?.uFade?.value ?? 0,
    },
    uOffset: {
      value: referenceMaterial.uniforms?.uOffset?.value ?? 0,
    },
  },
})

const syncMetalTimeline = (object, timelineProxy) => {
  const fade = timelineProxy.uniforms.uFade.value
  object.visible = true
  if (object.material) object.material.opacity = fade * 0.85
}

const createMetalMaterial = (
  sourceMaterial,
  {
    color = metalPlacement.color,
    opacity = 1,
    wireframe = true,
  } = {},
) => {
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
  if ('emissiveIntensity' in material) {
    material.emissiveIntensity = wireframe ? 2 : 3
  }
  material.needsUpdate = true
  return material
}

const adaptMetalMaterial = sourceMaterial =>
  createMetalMaterial(sourceMaterial, { wireframe: false })

const fitMetalToTarget = (metal, target, scratch) => {
  metal.updateWorldMatrix(true, true)
  target.updateWorldMatrix(true, true)
  const targetBox = new scratch.Box3().setFromObject(target)
  const metalBox = new scratch.Box3().setFromObject(metal)
  const targetSize = targetBox.getSize(new scratch.Vector3())
  const metalSize = metalBox.getSize(new scratch.Vector3())
  const targetMax = Math.max(targetSize.x, targetSize.y, targetSize.z)
  const metalMax = Math.max(metalSize.x, metalSize.y, metalSize.z)

  if (targetMax > 0 && metalMax > 0) {
    metal.scale.multiplyScalar(targetMax / metalMax)
    metal.updateWorldMatrix(true, true)
  }

  const targetCenter = targetBox.getCenter(new scratch.Vector3())
  const metalCenter = new scratch.Box3().setFromObject(metal).getCenter(new scratch.Vector3())
  const parent = metal.parent
  if (parent?.worldToLocal) {
    metal.position.add(
      parent.worldToLocal(targetCenter.clone()).sub(parent.worldToLocal(metalCenter.clone())),
    )
  } else {
    metal.position.add(targetCenter.sub(metalCenter))
  }
}

const applyMetalPlacement = metal => {
  metal.scale.multiplyScalar(metalPlacement.scale)
  metal.rotation.x += metalPlacement.rotation.x
  metal.rotation.y += metalPlacement.rotation.y
  metal.rotation.z += metalPlacement.rotation.z
  metal.position.x += metalPlacement.offset.x
  metal.position.y += metalPlacement.offset.y
  metal.position.z += metalPlacement.offset.z
}

const syncMetalToCameraFrame = ({ app, metal, targetCenter, scratch }) => {
  const renderCamera = app.webgl.camera
  const sourceCamera = app.webgl.camera.tertiaryCamera
  if (!renderCamera || !sourceCamera) return

  sourceCamera.updateMatrixWorld(true)
  sourceCamera.updateProjectionMatrix()
  renderCamera.updateMatrixWorld(true)
  renderCamera.updateProjectionMatrix()

  const projected = targetCenter.clone().project(sourceCamera)
  const framed = new scratch.Vector3(
    projected.x + metalPlacement.offset.x,
    projected.y + metalPlacement.offset.y,
    0.92,
  ).unproject(renderCamera)
  const direction = framed.clone().sub(renderCamera.getWorldPosition(new scratch.Vector3())).normalize()
  const worldPosition = renderCamera
    .getWorldPosition(new scratch.Vector3())
    .add(direction.multiplyScalar(Math.abs(metalPlacement.offset.z)))

  if (metal.parent?.worldToLocal) {
    metal.position.copy(metal.parent.worldToLocal(worldPosition))
  } else {
    metal.position.copy(worldPosition)
  }
}

const lockMetalScreenScale = ({ app, metalMesh, state, scratch }) => {
  const camera = app.webgl.camera
  if (!camera) return

  metalMesh.updateWorldMatrix(true, true)
  camera.updateMatrixWorld(true)
  const center = new scratch.Box3().setFromObject(metalMesh).getCenter(new scratch.Vector3())
  const distance = camera.getWorldPosition(new scratch.Vector3()).distanceTo(center)

  if (!state.distance) {
    state.distance = distance
    state.scale = metalMesh.scale.clone()
  }
  if (!state.distance || distance <= 0) return
  metalMesh.scale.copy(state.scale).multiplyScalar(distance / state.distance)
}

export const replaceLastLoop2ModelWithMetal = ({ app, holograms }) => {
  const oldModel = holograms[metalTargetIndex]
  const metalSource = getMetalMesh(app)
  if (!oldModel || !metalSource?.clone) return null

  const oldParent = oldModel.parent
  if (!oldParent) return null

  oldModel.geometry?.computeBoundingBox()
  const scratch = {
    Box3: oldModel.geometry.boundingBox.constructor,
    Vector3: oldModel.position.constructor,
  }
  oldModel.updateWorldMatrix(true, true)
  const targetCenter = new scratch.Box3().setFromObject(oldModel).getCenter(new scratch.Vector3())
  const screenScaleState = { distance: 0, scale: null }
  const metal = new oldParent.constructor()
  metal.name = 'Loop2MetalModel'
  metal.position.copy(oldModel.position)
  metal.quaternion.copy(oldModel.quaternion)
  metal.scale.copy(oldModel.scale)
  const timelineProxy = createMetalTimelineProxy(oldModel.material)
  metal.material = timelineProxy

  const metalMesh = metalSource.clone(true)
  metalMesh.name = 'Metal'
  metalMesh.position.set(0, 0, 0)
  metalMesh.rotation.set(0, 0, 0)
  metalMesh.scale.set(1, 1, 1)
  metalMesh.geometry = metalMesh.geometry.clone()
  metalMesh.layers.mask = oldModel.layers.mask
  metalMesh.material = adaptMetalMaterial(metalMesh.material)
  metalMesh.frustumCulled = false
  metalMesh.renderOrder = 10
  metalMesh.onBeforeRender = () => {
    syncMetalToCameraFrame({ app, metal, targetCenter, scratch })
    lockMetalScreenScale({ app, metalMesh, state: screenScaleState, scratch })
    syncMetalTimeline(metalMesh, timelineProxy)
  }
  syncMetalTimeline(metalMesh, timelineProxy)

  metal.add(metalMesh)
  oldParent.add(metal)
  fitMetalToTarget(metal, oldModel, scratch)
  applyMetalPlacement(metal)
  oldModel.removeFromParent()

  return metal
}
