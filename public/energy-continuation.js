import { g as gsap } from '/_astro/index.Brfk6Bdo.js'
import { createBlackoutTransition } from '/transitions/blackout-transition.js?v=fog-sides-20260726-1'
import { replaceFirstLoop2ModelWithOil } from '/models/oil-loop2-scene.js?v=oil-step1-20260727-23'
import { replaceLastLoop2ModelWithMetal } from '/models/metal-loop2-scene.js?v=metal-step1-20260728-1'

/* global document, window, ResizeObserver */

const additionalChapterCount = 1
const retryDelay = 100
const retryLimit = 300
const curveSamples = 100

const clamp = value => Math.min(1, Math.max(0, value))
const cinematicEase = value => 0.5 - 0.5 * Math.cos(Math.PI * value)

const getSourceChapter = app =>
  app.webgl?.pages?.FortEnergy?.chapters?.FortEnergyChapter

const createStage = grid => {
  const stage = document.createElement('div')
  stage.dataset.faraEnergyContinuation = ''
  stage.setAttribute('aria-hidden', 'true')
  stage.style.cssText = 'position:relative;width:100%;pointer-events:none;'
  grid.after(stage)
  return stage
}

const median = values => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2
}

const sampleCurveLength = curve => {
  let length = 0
  let previous = curve.getPoint(0)
  for (let index = 1; index <= curveSamples; index += 1) {
    const current = curve.getPoint(index / curveSamples)
    length += current.distanceTo(previous)
    previous = current
  }
  return length
}

const getProjectedSceneSpan = (model, direction) => {
  let minimum = Number.POSITIVE_INFINITY
  let maximum = Number.NEGATIVE_INFINITY

  model.updateWorldMatrix(true, true)
  model.traverse(object => {
    if (!object.isMesh || object.name === 'Grid' || !object.geometry) return
    object.geometry.computeBoundingBox()
    const bounds = object.geometry.boundingBox
    if (!bounds) return

    for (const x of [bounds.min.x, bounds.max.x]) {
      for (const y of [bounds.min.y, bounds.max.y]) {
        for (const z of [bounds.min.z, bounds.max.z]) {
          const corner = direction
            .clone()
            .set(x, y, z)
            .applyMatrix4(object.matrixWorld)
          const projection = corner.dot(direction)
          minimum = Math.min(minimum, projection)
          maximum = Math.max(maximum, projection)
        }
      }
    }
  })

  return maximum - minimum
}

const getGridWorldNormal = grid => {
  grid.geometry.computeBoundingBox()
  const size = grid.geometry.boundingBox.getSize(
    grid.position.clone(),
  )
  const smallestAxis =
    size.x <= size.y && size.x <= size.z
      ? 'x'
      : size.y <= size.z
        ? 'y'
        : 'z'
  const normal = grid.position.clone().set(0, 0, 0)
  normal[smallestAxis] = 1
  return normal
    .applyQuaternion(grid.getWorldQuaternion(grid.quaternion.clone()))
    .normalize()
}

const calculatePlacement = source => {
  source.model.updateWorldMatrix(true, true)
  const cameraPoints = source.camerasPositions.map(object =>
    object.getWorldPosition(object.position.clone()),
  )
  const first = cameraPoints.at(0)
  const last = cameraPoints.at(-1)
  const travel = last.clone().sub(first)
  const gridNormal = getGridWorldNormal(source.grid)
  const planarTravel = travel
    .clone()
    .addScaledVector(gridNormal, -travel.dot(gridNormal))
  const planarCameraTravel = planarTravel.length()
  const direction = planarTravel.normalize()
  const sceneSpan = getProjectedSceneSpan(source.model, direction)
  const cameraSpacing = median(
    cameraPoints
      .slice(1)
      .map((point, index) => point.distanceTo(cameraPoints[index])),
  )
  const offsetDistance = Math.max(
    travel.length(),
    sceneSpan + cameraSpacing,
  )

  return {
    offset: direction.multiplyScalar(offsetDistance),
    metrics: {
      cameraTravel: travel.length(),
      planarCameraTravel,
      sceneSpan,
      cameraSpacing,
      offsetDistance,
      gridNormal: gridNormal.toArray(),
    },
  }
}

const createIndependentMaterial = (source, target, camera) => {
  const Material = source.material.constructor
  const sourceUniforms = source.material.uniforms
  const material = source.name.startsWith('Hologram')
    ? new Material(
        {
          map: sourceUniforms.tMap?.value,
          name: source.material.name,
        },
        target,
      )
    : new Material()

  material.uniforms.projectionMatrix = {
    value: camera.tertiaryCamera.projectionMatrix,
  }
  material.uniforms.viewMatrix = {
    value: camera.tertiaryCamera.matrixWorldInverse,
  }
  material.side = source.material.side
  return material
}

const sortNumberedNodes = (nodes, prefix) =>
  nodes.sort(
    (a, b) =>
      Number.parseInt(a.name.replace(prefix, ''), 10) -
      Number.parseInt(b.name.replace(prefix, ''), 10),
  )

const createTimeline = (instance, grid) => {
  const timeline = gsap.timeline({ paused: true })
  const [first, second, third, fourth] = instance.holograms
  const lineFades = instance.lines.map(
    object => object.material.uniforms.uFade,
  ).filter(Boolean)
  const middle = 0.5
  const duration = 0.3

  if (lineFades.length) {
    timeline.fromTo(
      lineFades,
      { value: 0 },
      { value: 1, duration: 0.1 },
      0,
    )
  }
  timeline.fromTo(
    instance.pageProgress,
    { value: 0 },
    { value: 1, duration: 1, ease: 'sine.out' },
    0,
  )
  if (first?.material?.uniforms?.uFade) {
    timeline.fromTo(
      first.material.uniforms.uFade,
      { value: 0 },
      { value: 1, duration: 0.1 },
      0,
    )
    timeline.to(
      first.material.uniforms.uFade,
      { value: 0, duration: 0.06 },
      0.17,
    )
  }
  if (second?.material?.uniforms?.uFade) {
    timeline.fromTo(
      second.material.uniforms.uFade,
      { value: 0 },
      { value: 1, duration: 0.08 },
      0.32,
    )
    timeline.to(
      second.material.uniforms.uFade,
      { value: 0, duration: 0.1 },
      0.5,
    )
  }
  if (grid?.material?.uniforms?.uDepth) {
    timeline.fromTo(
      grid.material.uniforms.uDepth,
      { value: 100 },
      { value: 120, duration },
      middle,
    )
  }
  if (third?.material?.uniforms?.uFade) {
    timeline.fromTo(
      third.material.uniforms.uFade,
      { value: 0 },
      { value: 1, duration },
      middle + duration * 0.4 + 0.1,
    )
  }
  if (fourth?.material?.uniforms?.uOffset) {
    timeline.fromTo(
      fourth.material.uniforms.uOffset,
      { value: 0 },
      { value: 0.1, duration: duration * 0.8 },
      middle + duration * 0.4 + 0.2,
    )
  }
  if (fourth?.material?.uniforms?.uFade) {
    timeline.fromTo(
      fourth.material.uniforms.uFade,
      { value: 0 },
      { value: 1, duration },
      middle + duration * 0.4 + 0.15,
    )
  }
  timeline.add(() => {}, 1.2)
  return timeline
}

const createChapterInstance = (
  source,
  app,
  worldOffset,
  index,
) => {
  const group = source.wrapper.clone(false)
  const model = source.model.clone(true)
  group.name = `FortEnergyChapter${index + 1}`
  group.clear()
  model.name = `EnergyChapter${index + 1}`
  model.position.add(worldOffset)

  model.getObjectByName('Grid')?.removeFromParent()

  const holograms = []
  const lines = []
  const cameras = []
  const lookAts = []

  model.traverse(object => {
    if (object.isPerspectiveCamera) cameras.push(object)
    if (object.name.startsWith('LookAt')) lookAts.push(object)

    const sourceName = object.name
    if (
      object.isMesh &&
      (sourceName.startsWith('Hologram') ||
        sourceName.startsWith('Line'))
    ) {
      const sourceObject = source.model.getObjectByName(sourceName)
      object.material = createIndependentMaterial(
        sourceObject,
        object,
        app.webgl.camera,
      )
      object.frustumCulled = false
      if (sourceName.startsWith('Hologram')) holograms.push(object)
      if (sourceName.startsWith('Line')) lines.push(object)
    }
  })

  group.add(model)
  const oilModel = replaceFirstLoop2ModelWithOil({
    app,
    holograms,
  })
  const metalModel = replaceLastLoop2ModelWithMetal({
    app,
    holograms,
  })
  const activeHolograms = [
    oilModel ?? holograms[0],
    metalModel ?? holograms[1],
    holograms[2],
    holograms[3],
  ]
  group.updateWorldMatrix(true, true)
  sortNumberedNodes(cameras, 'Camera')
  sortNumberedNodes(lookAts, 'LookAt')
  sortNumberedNodes(lines, 'Line')

  const getWorldPoints = nodes =>
    nodes.map(node => node.getWorldPosition(worldOffset.clone()))
  const Curve = source.camCurve.constructor
  const instance = {
    index,
    group,
    model,
    holograms: activeHolograms,
    lines,
    cameras,
    lookAts,
    camCurve: new Curve(
      getWorldPoints(cameras),
      false,
      'centripetal',
    ),
    lookAtCurve: new Curve(
      getWorldPoints(lookAts),
      false,
      'centripetal',
    ),
    pageProgress: { value: 0 },
    active: false,
  }
  instance.timeline = createTimeline(instance, source.grid)
  return instance
}

const cubicPoint = (
  start,
  startControl,
  endControl,
  end,
  progress,
  target,
) => {
  const inverse = 1 - progress
  target
    .copy(start)
    .multiplyScalar(inverse * inverse * inverse)
    .addScaledVector(
      startControl,
      3 * inverse * inverse * progress,
    )
    .addScaledVector(
      endControl,
      3 * inverse * progress * progress,
    )
    .addScaledVector(end, progress * progress * progress)
  return target
}

const curveTangent = (curve, start, distance, target) => {
  const first = curve.getPoint(start ? 0 : 1)
  const nearby = curve.getPoint(start ? 0.01 : 0.99)
  target
    .subVectors(start ? nearby : first, start ? first : nearby)
    .normalize()
    .multiplyScalar(distance / 3)
  return target
}

class EnergyChapterSequence {
  constructor(app, events, source, gridElement) {
    this.app = app
    this.events = events
    this.source = source
    this.gridElement = gridElement
    this.stage = createStage(gridElement)
    this.instances = []
    this.connectors = []
    this.cameraPosition = source.cameraPosition.clone()
    this.lookAt = source.cameralookAt.clone()
    this.rangeEnd = 0
    this.initializePersistentGrid()
    this.gridBasePosition = this.source.grid.position.clone()
    this.createInstances()
    this.blackoutTransition = createBlackoutTransition({
      getRanges: () => ({
        connector: this.connectors[0],
        instance: this.instances[0],
      }),
    })
    this.install()
  }

  initializePersistentGrid() {
    this.source.model.updateWorldMatrix(true, true)
    this.app.webgl.mainScene.attach(this.source.grid)
    this.source.grid.userData.faraPersistentWorldObject = true
  }

  createInstances() {
    const placement = calculatePlacement(this.source)
    this.source.userData.faraContinuationMetrics =
      placement.metrics

    for (
      let index = 0;
      index < additionalChapterCount;
      index += 1
    ) {
      const offset = placement.offset
        .clone()
        .multiplyScalar(index + 1)
      const instance = createChapterInstance(
        this.source,
        this.app,
        offset,
        index + 1,
      )
      this.instances.push(instance)
    }
  }

  createConnector(
    previousCameraCurve,
    previousLookAtCurve,
    next,
  ) {
    const cameraStart = previousCameraCurve.getPoint(1)
    const cameraEnd = next.camCurve.getPoint(0)
    const lookAtStart = previousLookAtCurve.getPoint(1)
    const lookAtEnd = next.lookAtCurve.getPoint(0)
    const distance = cameraStart.distanceTo(cameraEnd)
    const cameraStartControl = cameraStart
      .clone()
      .add(
        curveTangent(
          previousCameraCurve,
          false,
          distance,
          cameraStart.clone(),
        ),
      )
    const cameraEndControl = cameraEnd
      .clone()
      .sub(
        curveTangent(
          next.camCurve,
          true,
          distance,
          cameraEnd.clone(),
        ),
      )
    const lookAtDistance = lookAtStart.distanceTo(lookAtEnd)
    const lookAtStartControl = lookAtStart
      .clone()
      .add(
        curveTangent(
          previousLookAtCurve,
          false,
          lookAtDistance,
          lookAtStart.clone(),
        ),
      )
    const lookAtEndControl = lookAtEnd
      .clone()
      .sub(
        curveTangent(
          next.lookAtCurve,
          true,
          lookAtDistance,
          lookAtEnd.clone(),
        ),
      )

    return {
      cameraStart,
      cameraStartControl,
      cameraEndControl,
      cameraEnd,
      lookAtStart,
      lookAtStartControl,
      lookAtEndControl,
      lookAtEnd,
      distance,
    }
  }

  measure = () => {
    const cycleLength =
      this.source.scrollRange.end - this.source.scrollRange.start
    const pathLength = sampleCurveLength(this.source.camCurve)
    const pixelsPerWorldUnit = cycleLength / pathLength
    let cursor = this.source.scrollRange.end
    let previousCameraCurve = this.source.camCurve
    let previousLookAtCurve = this.source.lookAtCurve

    this.connectors = this.instances.map(instance => {
      const connector = this.createConnector(
        previousCameraCurve,
        previousLookAtCurve,
        instance,
      )
      const connectorLength =
        connector.distance * pixelsPerWorldUnit
      connector.start = cursor
      connector.end = cursor + connectorLength
      instance.start = connector.end
      instance.end = instance.start + cycleLength
      cursor = instance.end
      previousCameraCurve = instance.camCurve
      previousLookAtCurve = instance.lookAtCurve
      return connector
    })

    this.rangeEnd = cursor
    this.stage.style.height = `${
      cursor - this.source.scrollRange.end
    }px`
  }

  setActive(instance, active) {
    if (instance.active === active) return
    instance.active = active
    if (active) {
      this.app.webgl.mainScene.add(instance.group)
    } else {
      this.app.webgl.mainScene.remove(instance.group)
    }
  }

  hideAllInstances() {
    this.instances.forEach(instance =>
      this.setActive(instance, false),
    )
  }

  updateCamera(position, lookAt) {
    const camera = this.app.webgl.camera.tertiaryCamera
    camera.position.copy(position)
    camera.lookAt(lookAt)
    this.app.webgl.camera.parallaxTertiary()
    camera.updateMatrixWorld()
  }

  updateGrid(scroll) {
    const activeInstance = this.instances.find(
      instance =>
        scroll >= this.connectors[instance.index - 1]?.start &&
        scroll <= this.rangeEnd,
    )

    this.source.grid.position.copy(this.gridBasePosition)
    if (activeInstance) {
      this.source.grid.position.add(activeInstance.model.position)
    }
    this.source.grid.updateMatrixWorld()
  }

  tick = () => {
    this.updateGrid(this.app.webgl.scrollProgress)
    const scroll = this.app.webgl.lerpedScrollProgress
    this.blackoutTransition.update(this.app.webgl.scrollProgress)
    if (scroll < this.source.scrollRange.end) return

    for (let index = 0; index < this.instances.length; index += 1) {
      const connector = this.connectors[index]
      const instance = this.instances[index]

      if (scroll >= connector.start && scroll < connector.end) {
        this.hideAllInstances()
        const progress = cinematicEase(
          clamp(
            (scroll - connector.start) /
              (connector.end - connector.start),
          ),
        )
        cubicPoint(
          connector.cameraStart,
          connector.cameraStartControl,
          connector.cameraEndControl,
          connector.cameraEnd,
          progress,
          this.cameraPosition,
        )
        cubicPoint(
          connector.lookAtStart,
          connector.lookAtStartControl,
          connector.lookAtEndControl,
          connector.lookAtEnd,
          progress,
          this.lookAt,
        )
        this.updateCamera(this.cameraPosition, this.lookAt)
        return
      }

      if (scroll >= instance.start && scroll < instance.end) {
        this.hideAllInstances()
        this.setActive(instance, true)
        const progress = clamp(
          (scroll - instance.start) /
            (instance.end - instance.start),
        )
        instance.timeline.progress(progress, false)
        instance.camCurve.getPoint(
          instance.pageProgress.value,
          this.cameraPosition,
        )
        instance.lookAtCurve.getPoint(
          instance.pageProgress.value,
          this.lookAt,
        )
        this.updateCamera(this.cameraPosition, this.lookAt)
        return
      }
    }

    this.hideAllInstances()
  }

  install() {
    this.resizeObserver = new ResizeObserver(this.measure)
    this.resizeObserver.observe(this.gridElement)
    window.addEventListener('resize', this.measure, {
      passive: true,
    })
    this.app.state.on(this.events.TICK, this.tick)
    this.source.userData.faraContinuationInstalled = true
    this.measure()
  }
}

export const installEnergyContinuation = (app, events) => {
  if (app.__faraEnergyContinuationScheduled) return
  app.__faraEnergyContinuationScheduled = true

  let attempts = 0
  const tryInstall = () => {
    attempts += 1
    const source = getSourceChapter(app)
    const grid = document.querySelector(
      '#grid[data-chapter="FortEnergyChapter"]',
    )

    if (
      source?.scrollRange &&
      source?.scrollTl &&
      source?.model &&
      grid
    ) {
      app.__faraEnergySequence = new EnergyChapterSequence(
        app,
        events,
        source,
        grid,
      )
      return
    }

    if (attempts < retryLimit) {
      window.setTimeout(tryInstall, retryDelay)
    }
  }

  tryInstall()
}
