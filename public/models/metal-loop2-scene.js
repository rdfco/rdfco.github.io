/* global window */

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
