const oilResourceKeys = ['oil', 'Oil']

// Tune these values only. The visible mesh is the Barrel mesh from Oil.glb.
const oilPlacement = {
  color: '#00ff00',
  scale: 0.42,
  offset: {
    x: 0.2,
    y: 0.1,
    z: -8,
  },
  rotation: {
    x: 0.45,
    y: -0.75,
    z: -0.2,
  },
  screenAnchor: {
    x: 0.129,
    y: -0.242,
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
  if (object.material) object.material.opacity = fade
}

const adaptOilMaterial = sourceMaterial => {
  const Material = sourceMaterial.constructor
  const material = new Material({
    color: oilPlacement.color,
    wireframe: true,
    transparent: true,
    opacity: 1,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  })

  material.side = 2
  material.blending = 2
  if (material.color?.set) material.color.set(oilPlacement.color)
  if (material.emissive?.set) material.emissive.set(oilPlacement.color)
  if ('emissiveIntensity' in material) material.emissiveIntensity = 2
  material.needsUpdate = true
  return material
}

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

const getCameraFramePoint = ({ camera, ndcX, ndcY, viewDepth, scratch }) => {
  const position = camera.getWorldPosition(new scratch.Vector3())
  const elements = camera.matrixWorld.elements
  const right = new scratch.Vector3(elements[0], elements[1], elements[2])
  const up = new scratch.Vector3(elements[4], elements[5], elements[6])
  const forward = new scratch.Vector3(-elements[8], -elements[9], -elements[10])
  const halfHeight =
    viewDepth *
    Math.tan((camera.fov * Math.PI) / 360) /
    camera.zoom
  const halfWidth = halfHeight * camera.aspect

  return position
    .add(forward.multiplyScalar(viewDepth))
    .add(right.multiplyScalar(ndcX * halfWidth))
    .add(up.multiplyScalar(ndcY * halfHeight))
}

const moveOilCenterTo = ({ oil, barrel, worldCenter, scratch }) => {
  barrel.updateWorldMatrix(true, true)
  const currentCenter = new scratch.Box3()
    .setFromObject(barrel)
    .getCenter(new scratch.Vector3())
  const oilWorldPosition = oil.getWorldPosition(new scratch.Vector3())
  const targetOilWorldPosition = oilWorldPosition.add(
    worldCenter.clone().sub(currentCenter),
  )

  if (oil.parent?.worldToLocal) {
    oil.position.copy(oil.parent.worldToLocal(targetOilWorldPosition))
  } else {
    oil.position.copy(targetOilWorldPosition)
  }
  oil.updateWorldMatrix(true, true)
  barrel.updateWorldMatrix(true, true)
}

const syncOilToCameraFrame = ({
  app,
  oil,
  barrel,
  scratch,
  frameState,
  shouldLockFrame,
}) => {
  const renderCamera = app.webgl.camera
  if (!renderCamera) return

  renderCamera.updateMatrixWorld(true)
  renderCamera.updateProjectionMatrix()

  if (frameState.ndcX !== null) {
    moveOilCenterTo({
      oil,
      barrel,
      worldCenter: getCameraFramePoint({
        camera: renderCamera,
        ndcX: frameState.ndcX,
        ndcY: frameState.ndcY,
        viewDepth: frameState.viewDepth,
        scratch,
      }),
      scratch,
    })
    return
  }

  const worldPosition = getCameraFramePoint({
    camera: renderCamera,
    ndcX: oilPlacement.screenAnchor.x,
    ndcY: oilPlacement.screenAnchor.y,
    viewDepth: Math.abs(oilPlacement.offset.z),
    scratch,
  })

  if (oil.parent?.worldToLocal) {
    oil.position.copy(oil.parent.worldToLocal(worldPosition))
  } else {
    oil.position.copy(worldPosition)
  }
  oil.updateWorldMatrix(true, true)
  barrel.updateWorldMatrix(true, true)

  if (shouldLockFrame) {
    const center = new scratch.Box3()
      .setFromObject(barrel)
      .getCenter(new scratch.Vector3())
    const cameraCenter = center
      .clone()
      .applyMatrix4(renderCamera.matrixWorldInverse)
    const screenCenter = center.clone().project(renderCamera)
    frameState.ndcX = screenCenter.x
    frameState.ndcY = screenCenter.y
    frameState.viewDepth = Math.abs(cameraCenter.z)
    moveOilCenterTo({
      oil,
      barrel,
      worldCenter: getCameraFramePoint({
        camera: renderCamera,
        ndcX: frameState.ndcX,
        ndcY: frameState.ndcY,
        viewDepth: frameState.viewDepth,
        scratch,
      }),
      scratch,
    })
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
  const viewDepth = Math.abs(
    center.clone().applyMatrix4(camera.matrixWorldInverse).z,
  )

  if (!state.viewDepth) {
    state.viewDepth = viewDepth
    state.scale = barrel.scale.clone()
  }

  if (!state.viewDepth || viewDepth <= 0) return
  barrel.scale
    .copy(state.scale)
    .multiplyScalar(viewDepth / state.viewDepth)
  barrel.updateWorldMatrix(true, true)
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
  const screenScaleState = {
    viewDepth: 0,
    scale: null,
  }
  const screenFrameState = {
    ndcX: null,
    ndcY: null,
    viewDepth: 0,
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
  barrel.layers.mask = oldModel.layers.mask
  barrel.material = adaptOilMaterial(barrel.material)
  barrel.frustumCulled = false
  barrel.renderOrder = 10
  barrel.onBeforeRender = () => {
    const isVisible = fadeProxy.uniforms.uFade.value > 0.01
    syncOilToCameraFrame({
      app,
      oil,
      barrel,
      scratch,
      frameState: screenFrameState,
      shouldLockFrame: isVisible,
    })
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
