/* global window, document */

const metalResourceKeys = ['metal', 'Metal', 'metals', 'Metals']
const metalTargetIndex = 1

const getHologramColor = key =>
  window.FARA_BACKGROUND_COLORS?.[key] ?? '#37b478'

const metalPlacement = {
  color: getHologramColor('hologram'),
  count: 9,
  depth: 12,
  metalGap: 0.68,
  visibleArcSlots: 4.2,
  entryScreenX: -0.08,
  entryScreenY: -0.62,
  exitScreenX: 0.58,
  exitScreenY: 0.06,
  screenLength: 0.22,
  baseScreenAngle: -Math.PI / 2,
  pathTangentInfluence: 0.04,
  viewAngleOffset: -0.32,
  metalViewAngleOffset: 0.78,
  metalFacingFlip: Math.PI,
  visibleExtentScale: 0.9,
  fillOpacity: 0.2,
  glowOpacity: 0.06,
  edgeOpacity: 0.42,
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
  object.traverse?.(child => {
    if (child.material) {
      child.material.opacity =
        fade * (child.userData.metalOpacity ?? 0.72)
    }
  })
}

const createMetalMaterial = (
  sourceMaterial,
  {
    color = metalPlacement.color,
    opacity = 1,
    wireframe = false,
    additive = false,
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
  material.blending = additive ? 2 : 1
  if (material.color?.set) material.color.set(color)
  if (material.emissive?.set) material.emissive.set(color)
  if ('emissiveIntensity' in material) {
    material.emissiveIntensity = additive ? 1.15 : 0.9
  }
  material.needsUpdate = true
  return material
}

const createFillMaterial = sourceMaterial =>
  createMetalMaterial(sourceMaterial, {
    wireframe: false,
    opacity: metalPlacement.fillOpacity,
    additive: false,
  })

const createGlowMaterial = sourceMaterial =>
  createMetalMaterial(sourceMaterial, {
    wireframe: false,
    opacity: metalPlacement.glowOpacity,
    additive: true,
  })

const createEdgeMaterial = sourceMaterial =>
  createMetalMaterial(sourceMaterial, {
    wireframe: true,
    opacity: metalPlacement.edgeOpacity,
    additive: false,
  })

const getCanvasSize = app => {
  const canvas =
    app.webgl?.renderer?.domElement ??
    document.querySelector('canvas')
  return {
    width: canvas?.clientWidth || window.innerWidth || 1,
    height: canvas?.clientHeight || window.innerHeight || 1,
  }
}

const getCameraFrame = (camera, app) => {
  const { width, height } = getCanvasSize(app)
  const distance = metalPlacement.depth
  const fov = (camera.fov ?? 35) * Math.PI / 180
  const worldHeight = 2 * Math.tan(fov / 2) * distance
  const worldWidth = worldHeight * (camera.aspect || width / height || 1)
  const entry = {
    x: worldWidth * metalPlacement.entryScreenX,
    y: worldHeight * metalPlacement.entryScreenY,
  }
  const exit = {
    x: worldWidth * metalPlacement.exitScreenX,
    y: worldHeight * metalPlacement.exitScreenY,
  }
  const deltaX = entry.x - exit.x
  const deltaY = entry.y - exit.y
  const center = {
    x: exit.x,
    y:
      (deltaX * deltaX + entry.y * entry.y - exit.y * exit.y) /
      (2 * deltaY),
  }
  const radius = Math.abs(exit.y - center.y)
  const startAngle = Math.atan2(
    entry.y - center.y,
    entry.x - center.x,
  )
  const endAngle = Math.atan2(
    exit.y - center.y,
    exit.x - center.x,
  )

  return {
    distance,
    worldWidth,
    worldHeight,
    radius,
    center,
    startAngle,
    endAngle,
  }
}

const getArcLength = frame =>
  Math.abs(frame.endAngle - frame.startAngle) *
  frame.radius

const getMetalPathState = (distance, frame) => {
  const arcLength = getArcLength(frame)
  const direction =
    frame.endAngle >= frame.startAngle ? 1 : -1
  const angleForDistance = value =>
    frame.startAngle + direction * (value / frame.radius)
  const circularPoint = angle => ({
    x: frame.center.x + frame.radius * Math.cos(angle),
    y: frame.center.y + frame.radius * Math.sin(angle),
  })
  const tangentForAngle = angle => ({
    x: -Math.sin(angle) * direction,
    y: Math.cos(angle) * direction,
  })

  if (distance < 0) {
    const angle = frame.startAngle
    const point = circularPoint(angle)
    const tangent = tangentForAngle(angle)
    return {
      x: point.x + tangent.x * distance,
      y: point.y + tangent.y * distance,
      tangentX: tangent.x,
      tangentY: tangent.y,
    }
  }

  if (distance > arcLength) {
    const angle = frame.endAngle
    const point = circularPoint(angle)
    const tangent = tangentForAngle(angle)
    const exitDistance = distance - arcLength
    return {
      x: point.x + tangent.x * exitDistance,
      y: point.y + tangent.y * exitDistance,
      tangentX: tangent.x,
      tangentY: tangent.y,
    }
  }

  const angle = angleForDistance(distance)
  const point = circularPoint(angle)
  const tangent = tangentForAngle(angle)
  return {
    x: point.x,
    y: point.y,
    tangentX: tangent.x,
    tangentY: tangent.y,
  }
}

const placeMetalRootInCameraFrame = ({ app, metal, scratch }) => {
  const camera = app.webgl.camera
  if (!camera) return null

  camera.updateMatrixWorld(true)
  camera.updateProjectionMatrix?.()

  const cameraWorldQuaternion = camera.getWorldQuaternion(
    camera.quaternion.clone(),
  )
  const cameraPosition = camera.getWorldPosition(new scratch.Vector3())
  const forward = new scratch.Vector3(0, 0, -1)
    .applyQuaternion(cameraWorldQuaternion)
    .normalize()
  const worldPosition = cameraPosition.add(
    forward.multiplyScalar(metalPlacement.depth),
  )

  const parent = metal.parent
  if (parent?.worldToLocal) {
    metal.position.copy(parent.worldToLocal(worldPosition.clone()))
    if (parent.getWorldQuaternion && metal.quaternion?.copy) {
      const parentQuaternion = parent.getWorldQuaternion(metal.quaternion.clone())
      metal.quaternion.copy(parentQuaternion.invert().multiply(cameraWorldQuaternion))
    }
    if (parent.getWorldScale) {
      const parentScale = parent.getWorldScale(metal.scale.clone())
      metal.scale.set(
        parentScale.x ? 1 / parentScale.x : 1,
        parentScale.y ? 1 / parentScale.y : 1,
        parentScale.z ? 1 / parentScale.z : 1,
      )
    }
  } else {
    metal.position.copy(worldPosition)
    metal.quaternion.copy(cameraWorldQuaternion)
    metal.scale.set(1, 1, 1)
  }

  return getCameraFrame(camera, app)
}

const updateMetalSequence = ({ app, metal, scratch }) => {
  const frame = placeMetalRootInCameraFrame({ app, metal, scratch })
  if (!frame) return

  const motionProgress = metal.userData.metalMotionProgress ?? 0
  const arcLength = getArcLength(frame)
  const spacing =
    (arcLength / metalPlacement.visibleArcSlots) *
    metalPlacement.metalGap
  const modelLength = metal.userData.metalModelLength || 1
  const modelRadius = metal.userData.metalModelRadius || modelLength * 0.35
  const dynamicScale =
    (frame.worldWidth * metalPlacement.screenLength) /
    modelLength
  const visibleExtent =
    Math.max(
      modelLength * dynamicScale,
      modelRadius * dynamicScale * 2,
    ) * metalPlacement.visibleExtentScale
  const entryPadding = visibleExtent
  const exitPadding = visibleExtent
  const travelSpan =
    entryPadding +
    arcLength +
    exitPadding +
    spacing * (metalPlacement.count - 1)
  const baseTravel = -entryPadding + motionProgress * travelSpan
  metal.userData.metalArcMetrics = {
    arcLength,
    spacing,
    travelSpan,
    motionProgress,
    radius: frame.radius,
    startAngle: frame.startAngle,
    endAngle: frame.endAngle,
  }

  metal.userData.metalItems.forEach((item, index) => {
    const distance = baseTravel - index * spacing
    const visible =
      distance > -entryPadding &&
      distance < arcLength + exitPadding
    const pathState = getMetalPathState(distance, frame)
    const pathAngle = Math.atan2(-pathState.tangentX, pathState.tangentY)
    const viewAngle =
      metalPlacement.baseScreenAngle +
      pathAngle * metalPlacement.pathTangentInfluence

    item.arcPosition.position.set(pathState.x, pathState.y, 0)
    item.viewAngle.rotation.set(
      metalPlacement.viewAngleOffset,
      metalPlacement.metalViewAngleOffset +
        metalPlacement.metalFacingFlip,
      viewAngle,
    )
    item.meshes.forEach(mesh =>
      mesh.scale.set(dynamicScale, dynamicScale, dynamicScale),
    )
    item.arcPosition.visible = visible
  })

  syncMetalTimeline(metal, metal.material)
}

const createMetalItem = ({ metalSource, oldModel, index }) => {
  const Group = oldModel.parent.constructor
  const arcPosition = new Group()
  const viewAngle = new Group()
  const fill = metalSource.clone(true)
  const glow = metalSource.clone(true)
  const edge = metalSource.clone(true)

  arcPosition.name = `Metal${index + 1}ArcPosition`
  viewAngle.name = `Metal${index + 1}ViewAngle`
  fill.name = `Metal${index + 1}Fill`
  glow.name = `Metal${index + 1}Glow`
  edge.name = `Metal${index + 1}Edge`

  ;[fill, glow, edge].forEach(mesh => {
    mesh.position.set(0, 0, 0)
    mesh.rotation.set(0, 0, 0)
    mesh.layers.mask = oldModel.layers.mask
    mesh.frustumCulled = false
  })

  fill.material = createFillMaterial(fill.material)
  glow.material = createGlowMaterial(glow.material)
  edge.material = createEdgeMaterial(edge.material)
  glow.scale.multiplyScalar(1.025)
  edge.scale.multiplyScalar(1.012)
  fill.userData.metalOpacity = metalPlacement.fillOpacity
  glow.userData.metalOpacity = metalPlacement.glowOpacity
  edge.userData.metalOpacity = metalPlacement.edgeOpacity
  fill.renderOrder = 10 + index
  glow.renderOrder = 15 + index
  edge.renderOrder = 20 + index

  viewAngle.add(fill, glow, edge)
  arcPosition.add(viewAngle)

  return {
    arcPosition,
    viewAngle,
    meshes: [fill, glow, edge],
  }
}

export const replaceLastLoop2ModelWithMetal = ({ app, holograms }) => {
  const oldModel = holograms[metalTargetIndex]
  const metalSource = getMetalMesh(app)
  if (!oldModel || !metalSource?.clone) return null

  const oldParent = oldModel.parent
  if (!oldParent) return null

  oldModel.geometry?.computeBoundingBox()
  metalSource.geometry?.computeBoundingBox?.()
  const scratch = {
    Box3: oldModel.geometry.boundingBox.constructor,
    Vector3: oldModel.position.constructor,
  }
  const sourceSize = metalSource.geometry?.boundingBox
    ?.getSize(new scratch.Vector3()) ?? new scratch.Vector3(1, 1, 1)
  const modelLength = Math.max(sourceSize.x, sourceSize.y, sourceSize.z, 1)
  const modelRadius = Math.max(
    Math.min(sourceSize.x, sourceSize.y, sourceSize.z),
    modelLength * 0.25,
  )

  const metal = new oldParent.constructor()
  metal.name = 'Loop2MetalSequence'
  metal.position.copy(oldModel.position)
  metal.quaternion.copy(oldModel.quaternion)
  metal.scale.copy(oldModel.scale)

  const timelineProxy = createMetalTimelineProxy(oldModel.material)
  metal.material = timelineProxy
  metal.userData.metalMotionProgress = 0
  metal.userData.metalModelLength = modelLength
  metal.userData.metalModelRadius = modelRadius
  metal.userData.setMetalMotionProgress = progress => {
    metal.userData.metalMotionProgress = Math.min(1, Math.max(0, progress))
    updateMetalSequence({ app, metal, scratch })
  }
  metal.userData.updateMetalSequence = () => {
    updateMetalSequence({ app, metal, scratch })
  }
  metal.userData.metalItems = Array.from(
    { length: metalPlacement.count },
    (_, index) => createMetalItem({
      metalSource,
      oldModel,
      index,
    }),
  )
  metal.userData.metalPlacement = metalPlacement
  metal.userData.metalItems.forEach(item => {
    metal.add(item.arcPosition)
  })
  syncMetalTimeline(metal, timelineProxy)
  updateMetalSequence({ app, metal, scratch })

  oldParent.add(metal)
  oldModel.removeFromParent()

  return metal
}
