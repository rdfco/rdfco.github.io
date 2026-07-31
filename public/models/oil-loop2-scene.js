/* global window */

const oilResourceKeys = ['oil', 'Oil']
const getHologramColor = key =>
  window.FARA_BACKGROUND_COLORS?.[key] ?? '#37b478'

// Tune these values only. The visible mesh is the Barrel mesh from Oil.glb.
const oilPlacement = {
  color: getHologramColor('hologram'),
  glowColor: getHologramColor('hologramGlow'),
  count: 7,
  depth: 12,
  barrelLength: 3.3222,
  barrelRadius: 1.0246,
  oilGap: 1.24,
  visibleArcSlots: 4.2,
  entryScreenX: 0.52,
  entryScreenY: -0.52,
  exitScreenX: -0.52,
  exitScreenY: 0,
  screenLength: 0.185,
  baseScreenAngle: -Math.PI / 2,
  pathTangentInfluence: 0.06,
  viewAngleOffset: -0.36,
  barrelViewAngleOffset: 0.84,
  barrelFacingFlip: Math.PI,
  barrelRollSpeed: 0.5,
  scrollRollMultiplier: 0.35,
  backgroundSyncRollMultiplier: 0.9,
  visibleExtentScale: 0.85,
  fillOpacity: 0.18,
  glowOpacity: 0.05,
  detailOpacity: 0.26,
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
  object.traverse?.(child => {
    if (child.material) {
      child.material.opacity =
        fade * (child.userData.oilOpacity ?? 0.72)
    }
  })
}

const createOilMaterial = (sourceMaterial, {
  color = oilPlacement.color,
  opacity = 1,
  wireframe = true,
  additive = wireframe,
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
  material.blending = additive ? 2 : 1
  if (material.color?.set) material.color.set(color)
  if (material.emissive?.set) material.emissive.set(color)
  if ('emissiveIntensity' in material) material.emissiveIntensity = additive ? 1.15 : 0.9
  material.needsUpdate = true
  return material
}

const adaptOilMaterial = sourceMaterial =>
  createOilMaterial(sourceMaterial, {
    wireframe: false,
    opacity: oilPlacement.fillOpacity,
    additive: false,
  })

const createOilWireMaterial = sourceMaterial =>
  createOilMaterial(sourceMaterial, {
    color: oilPlacement.color,
    wireframe: false,
    opacity: oilPlacement.glowOpacity,
    additive: true,
  })

const createOilDetailMaterial = sourceMaterial =>
  createOilMaterial(sourceMaterial, {
    color: oilPlacement.color,
    wireframe: true,
    opacity: oilPlacement.detailOpacity,
    additive: false,
  })

const createGeometry = (sourceGeometry, positions) => {
  const Geometry = sourceGeometry.constructor
  const Attribute = sourceGeometry.attributes.position.constructor
  const geometry = new Geometry()
  geometry.setAttribute(
    'position',
    new Attribute(new Float32Array(positions), 3),
  )
  geometry.computeBoundingBox?.()
  geometry.computeBoundingSphere?.()
  return geometry
}

const pushQuad = (positions, a, b, c, d) => {
  positions.push(
    a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z,
    b.x, b.y, b.z, d.x, d.y, d.z, c.x, c.y, c.z,
  )
}

const addCylinderBand = ({
  positions,
  xStart,
  xEnd,
  radius,
  segments,
}) => {
  for (let segment = 0; segment < segments; segment += 1) {
    const first = (segment / segments) * Math.PI * 2
    const second = ((segment + 1) / segments) * Math.PI * 2
    const a = {
      x: xStart,
      y: Math.cos(first) * radius,
      z: Math.sin(first) * radius,
    }
    const b = {
      x: xEnd,
      y: Math.cos(first) * radius,
      z: Math.sin(first) * radius,
    }
    const c = {
      x: xStart,
      y: Math.cos(second) * radius,
      z: Math.sin(second) * radius,
    }
    const d = {
      x: xEnd,
      y: Math.cos(second) * radius,
      z: Math.sin(second) * radius,
    }
    pushQuad(positions, a, b, c, d)
  }
}

const addCapDisk = ({ positions, x, radius, segments }) => {
  for (let segment = 0; segment < segments; segment += 1) {
    const first = (segment / segments) * Math.PI * 2
    const second = ((segment + 1) / segments) * Math.PI * 2
    positions.push(
      x, 0, 0,
      x, Math.cos(first) * radius, Math.sin(first) * radius,
      x, Math.cos(second) * radius, Math.sin(second) * radius,
    )
  }
}

const addCapRing = ({
  positions,
  x,
  innerRadius,
  outerRadius,
  segments,
  yOffset = 0,
  zOffset = 0,
}) => {
  for (let segment = 0; segment < segments; segment += 1) {
    const first = (segment / segments) * Math.PI * 2
    const second = ((segment + 1) / segments) * Math.PI * 2
    const a = {
      x,
      y: yOffset + Math.cos(first) * innerRadius,
      z: zOffset + Math.sin(first) * innerRadius,
    }
    const b = {
      x,
      y: yOffset + Math.cos(first) * outerRadius,
      z: zOffset + Math.sin(first) * outerRadius,
    }
    const c = {
      x,
      y: yOffset + Math.cos(second) * innerRadius,
      z: zOffset + Math.sin(second) * innerRadius,
    }
    const d = {
      x,
      y: yOffset + Math.cos(second) * outerRadius,
      z: zOffset + Math.sin(second) * outerRadius,
    }
    pushQuad(positions, a, b, c, d)
  }
}

const createCleanBarrelFillGeometry = sourceGeometry => {
  const positions = []
  const segments = 72
  const halfLength = oilPlacement.barrelLength / 2
  const radius = oilPlacement.barrelRadius

  addCylinderBand({
    positions,
    xStart: -halfLength,
    xEnd: halfLength,
    radius,
    segments,
  })
  addCapDisk({ positions, x: -halfLength, radius, segments })
  addCapDisk({ positions, x: halfLength, radius, segments })
  return createGeometry(sourceGeometry, positions)
}

const createCleanBarrelDetailGeometry = sourceGeometry => {
  const positions = []
  const segments = 96
  const halfLength = oilPlacement.barrelLength / 2
  const radius = oilPlacement.barrelRadius * 1.012
  const ringWidth = oilPlacement.barrelLength * 0.0045
  const capOffset = oilPlacement.barrelLength * 0.006
  const ringPositions = [
    -halfLength,
    -halfLength + oilPlacement.barrelLength * 0.28,
    0,
    halfLength - oilPlacement.barrelLength * 0.28,
    halfLength,
  ]

  ringPositions.forEach(x => {
    addCylinderBand({
      positions,
      xStart: x - ringWidth,
      xEnd: x + ringWidth,
      radius,
      segments,
    })
  })

  ;[-halfLength - capOffset, halfLength + capOffset].forEach(x => {
    addCapRing({
      positions,
      x,
      innerRadius: radius * 0.92,
      outerRadius: radius,
      segments,
    })
    addCapRing({
      positions,
      x,
      innerRadius: radius * 0.17,
      outerRadius: radius * 0.2,
      segments,
    })
  })

  const bungRadius = radius * 0.11
  ;[
    { y: -radius * 0.42, z: radius * 0.45 },
    { y: radius * 0.42, z: -radius * 0.45 },
  ].forEach(({ y, z }) => {
    addCapRing({
      positions,
      x: halfLength + capOffset * 1.5,
      innerRadius: bungRadius * 0.55,
      outerRadius: bungRadius,
      segments: 48,
      yOffset: y,
      zOffset: z,
    })
  })

  return createGeometry(sourceGeometry, positions)
}

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
  const distance = oilPlacement.depth
  const fov = (camera.fov ?? 35) * Math.PI / 180
  const worldHeight = 2 * Math.tan(fov / 2) * distance
  const worldWidth = worldHeight * (camera.aspect || width / height || 1)
  const entry = {
    x: worldWidth * oilPlacement.entryScreenX,
    y: worldHeight * oilPlacement.entryScreenY,
  }
  const exit = {
    x: worldWidth * oilPlacement.exitScreenX,
    y: worldHeight * oilPlacement.exitScreenY,
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

const getOilPathState = (distance, frame) => {
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
      angle,
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
      angle,
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
    angle,
    x: point.x,
    y: point.y,
    tangentX: tangent.x,
    tangentY: tangent.y,
  }
}

const placeOilRootInCameraFrame = ({ app, oil, scratch }) => {
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
    forward.multiplyScalar(oilPlacement.depth),
  )

  const parent = oil.parent
  if (parent?.worldToLocal) {
    oil.position.copy(parent.worldToLocal(worldPosition.clone()))
    if (parent.getWorldQuaternion && oil.quaternion?.copy) {
      const parentQuaternion = parent.getWorldQuaternion(oil.quaternion.clone())
      oil.quaternion.copy(parentQuaternion.invert().multiply(cameraWorldQuaternion))
    }
    if (parent.getWorldScale) {
      const parentScale = parent.getWorldScale(oil.scale.clone())
      oil.scale.set(
        parentScale.x ? 1 / parentScale.x : 1,
        parentScale.y ? 1 / parentScale.y : 1,
        parentScale.z ? 1 / parentScale.z : 1,
      )
    }
  } else {
    oil.position.copy(worldPosition)
    oil.quaternion.copy(cameraWorldQuaternion)
    oil.scale.set(1, 1, 1)
  }

  return getCameraFrame(camera, app)
}

const updateOilSequence = ({ app, oil, scratch }) => {
  const frame = placeOilRootInCameraFrame({ app, oil, scratch })
  if (!frame) return

  const motionProgress = oil.userData.oilMotionProgress ?? 0
  const arcLength = getArcLength(frame)
  const spacing =
    (arcLength / oilPlacement.visibleArcSlots) *
    oilPlacement.oilGap
  const dynamicScale =
    (frame.worldWidth * oilPlacement.screenLength) /
    oilPlacement.barrelLength
  const visibleExtent =
    Math.max(
      oilPlacement.barrelLength * dynamicScale,
      oilPlacement.barrelRadius * dynamicScale * 2,
    ) * oilPlacement.visibleExtentScale
  const entryPadding = visibleExtent
  const exitPadding = visibleExtent
  const travelSpan =
    entryPadding +
    arcLength +
    exitPadding +
    spacing * (oilPlacement.count - 1)
  const baseTravel = -entryPadding + motionProgress * travelSpan
  oil.userData.oilArcMetrics = {
    arcLength,
    spacing,
    travelSpan,
    entryPadding,
    exitPadding,
    visibleExtent,
    radius: frame.radius,
    startAngle: frame.startAngle,
    endAngle: frame.endAngle,
    motionProgress,
  }

  oil.userData.oilItems.forEach((item, index) => {
    const distance = baseTravel - index * spacing
    const visible =
      distance > -entryPadding &&
      distance < arcLength + exitPadding
    const pathState = getOilPathState(distance, frame)
    const pathAngle = Math.atan2(-pathState.tangentX, pathState.tangentY)
    const viewAngle =
      oilPlacement.baseScreenAngle +
      pathAngle * oilPlacement.pathTangentInfluence
    const pathRoll =
      (distance / oilPlacement.barrelRadius) *
      oilPlacement.scrollRollMultiplier

    item.arcPosition.position.set(pathState.x, pathState.y, 0)
    item.viewAngle.rotation.set(
      oilPlacement.viewAngleOffset,
      oilPlacement.barrelViewAngleOffset +
        oilPlacement.barrelFacingFlip,
      viewAngle,
    )
    item.barrelRoll.userData.oilPathRoll = pathRoll
    item.updateBarrelRoll()
    item.barrels.forEach(barrel =>
      barrel.scale.set(dynamicScale, dynamicScale, dynamicScale),
    )
    item.arcPosition.visible = visible
  })

  syncOilFade(oil, oil.material)
}

const createOilItem = ({ oilSource, oldModel, index }) => {
  const Group = oldModel.parent.constructor
  const arcPosition = new Group()
  const viewAngle = new Group()
  const barrelRoll = new Group()
  const barrel = oilSource.clone(true)
  const glowBarrel = oilSource.clone(true)
  const detailBarrel = oilSource.clone(true)

  arcPosition.name = `Oil${index + 1}ArcPosition`
  viewAngle.name = `Oil${index + 1}ViewAngle`
  barrelRoll.name = `Oil${index + 1}BarrelRoll`
  barrel.name = `Oil${index + 1}Barrel`
  glowBarrel.name = `Oil${index + 1}Glow`
  detailBarrel.name = `Oil${index + 1}Detail`

  const initialRotation = barrel.rotation.clone()
  barrel.position.set(0, 0, 0)
  glowBarrel.position.set(0, 0, 0)
  detailBarrel.position.set(0, 0, 0)
  glowBarrel.rotation.copy(initialRotation)
  detailBarrel.rotation.copy(initialRotation)
  barrel.layers.mask = oldModel.layers.mask
  glowBarrel.layers.mask = oldModel.layers.mask
  detailBarrel.layers.mask = oldModel.layers.mask
  barrel.material = adaptOilMaterial(barrel.material)
  glowBarrel.material = createOilWireMaterial(glowBarrel.material)
  detailBarrel.material = createOilDetailMaterial(detailBarrel.material)
  glowBarrel.scale.multiplyScalar(1.018)
  detailBarrel.scale.multiplyScalar(1.01)
  barrel.userData.oilOpacity = oilPlacement.fillOpacity
  glowBarrel.userData.oilOpacity = oilPlacement.glowOpacity
  detailBarrel.userData.oilOpacity = oilPlacement.detailOpacity
  barrel.frustumCulled = false
  glowBarrel.frustumCulled = false
  detailBarrel.frustumCulled = false
  barrel.renderOrder = 10 + index
  glowBarrel.renderOrder = 15 + index
  detailBarrel.renderOrder = 20 + index

  barrelRoll.add(barrel, glowBarrel, detailBarrel)
  viewAngle.add(barrelRoll)
  arcPosition.add(viewAngle)

  const updateBarrelRoll = () => {
    const timeSeconds =
      (window.performance?.now?.() ?? Date.now()) * 0.001
    const syncedBackgroundRoll =
      (barrelRoll.userData.oilBackgroundSyncProgress ?? 0) *
      Math.PI * 2 *
      oilPlacement.backgroundSyncRollMultiplier
    barrelRoll.rotation.set(
      initialRotation.x,
      initialRotation.y +
        (barrelRoll.userData.oilPathRoll ?? 0) +
        syncedBackgroundRoll +
        timeSeconds * oilPlacement.barrelRollSpeed,
      initialRotation.z,
    )
  }
  barrel.onBeforeRender = updateBarrelRoll
  glowBarrel.onBeforeRender = updateBarrelRoll
  detailBarrel.onBeforeRender = updateBarrelRoll

  return {
    arcPosition,
    viewAngle,
    barrelRoll,
    barrel,
    glowBarrel,
    detailBarrel,
    barrels: [barrel, glowBarrel, detailBarrel],
    initialRotation,
    updateBarrelRoll,
  }
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

  const oil = new oldParent.constructor()
  oil.name = 'Loop2OilSequence'
  oil.position.copy(oldModel.position)
  oil.quaternion.copy(oldModel.quaternion)
  oil.scale.copy(oldModel.scale)

  const fadeProxy = createOilFadeProxy(oldModel.material)
  oil.material = fadeProxy
  oil.userData.oilMotionProgress = 0
  oil.userData.oilBackgroundSyncProgress = 0
  oil.userData.setOilMotionProgress = progress => {
    oil.userData.oilMotionProgress = Math.min(1, Math.max(0, progress))
    updateOilSequence({ app, oil, scratch })
  }
  oil.userData.setOilBackgroundSyncProgress = progress => {
    oil.userData.oilBackgroundSyncProgress = Math.min(
      1,
      Math.max(0, progress),
    )
    oil.userData.oilItems?.forEach(item => {
      item.barrelRoll.userData.oilBackgroundSyncProgress =
        oil.userData.oilBackgroundSyncProgress
      item.updateBarrelRoll()
    })
  }
  oil.userData.updateOilSequence = () => {
    updateOilSequence({ app, oil, scratch })
  }
  oil.userData.oilItems = Array.from(
    { length: oilPlacement.count },
    (_, index) => createOilItem({
      oilSource,
      oldModel,
      index,
    }),
  )
  oil.userData.oilPlacement = oilPlacement
  oil.userData.oilItems.forEach(item => {
    oil.add(item.arcPosition)
  })
  syncOilFade(oil, fadeProxy)
  updateOilSequence({ app, oil, scratch })

  oldParent.add(oil)
  oldModel.removeFromParent()

  return oil
}
