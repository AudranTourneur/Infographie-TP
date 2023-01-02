import { drawBernstein, getBernsteinPoints } from './courbesBezier.js'
import { MAP_JUNIA } from './junia.js'
import {
  addToArrayOrCreate,
  choose,
  disposeNode,
  drawAxisGraduation,
} from './utils.js'
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OrbitControls } from 'https://unpkg.com/three@0.119.1/examples/jsm/controls/OrbitControls.js'
import TWEEN from 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.esm.js'

/*
  Ce fichier contient la majorité de la logique mathématique pour les courbes de
  Bézier.
*/

// Instanciation du renderer (moteur de rendu)
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas'),
})

// Création d'un premier canvas principal
const canvas = document.getElementById('canvas')

// Comme on a une barre de tâche de 25% à droite, on change la taille de
// notre renderer
const desiredWidth = (window.innerWidth * 3) / 4
const desiredHeight = window.innerHeight
renderer.setSize(desiredWidth, desiredHeight)

// Création de la caméra
const camera = new THREE.PerspectiveCamera(
  45,
  desiredWidth / desiredHeight,
  0.5,
  1000,
)
camera.position.z = 100

// Utilisation de OrbitControls.js (librarie incluse dans three.js)
const controls = new OrbitControls(camera, renderer.domElement)

// Instanciation de la scène
const scene = new THREE.Scene()

scene.background = new THREE.Color(0.3, 0.3, 0.3)

// Définition des matériaux qui seront utilisés plus tard
const blueMaterial = new THREE.LineBasicMaterial({
  color: 0x0000ff,
  linewidth: 3,
})

const redMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 })

const greenMaterial = new THREE.LineBasicMaterial({
  color: 0x00ff00,
  linewidth: 2,
  side: THREE.DoubleSide,
})
const yellowMaterial = new THREE.LineBasicMaterial({
  color: 0xffff00,
  linewidth: 2,
})

const STEP = 0.1

// Liste qui contient les structures de contrôle placées par l'utilisateur
// Par défaut, elle est construite avec c1, c2 et c3
//export let listOfControlStructures = [c1];

export let listOfControlStructures = [{ data: [], visible: true }]

function drawSpheres(points, material, radius = 0.2) {
  let spheres = []
  for (const p of points) {
    const geometry = new THREE.SphereGeometry(radius, 32, 16)
    const sphere = new THREE.Mesh(geometry, material)
    sphere.position.set(p.x, p.y, p.z ?? 0)
    scene.add(sphere)
    spheres.push(sphere)
  }
  return spheres
}

function getSimpleLineSpacedPoints(controlPoints, step) {
  if (controlPoints.length < 2)
    throw Error(
      'Impossible de générer un ensemble de segments avec moins de 2 points',
    )
  const finalPoints = []
  for (let i = 0; i < controlPoints.length - 1; i++) {
    const startPoint = controlPoints[i]
    const endPoint = controlPoints[i + 1]

    const deltaVector = {
      x: endPoint.x - startPoint.x,
      y: endPoint.y - startPoint.y,
    }

    for (let j = 0; j <= 1; j += step) {
      finalPoints.push({
        x: startPoint.x + j * deltaVector.x,
        y: startPoint.y + j * deltaVector.y,
      })
    }
  }
  return finalPoints
}

// Renvoie l'ensemble des sommets espacés d'un certain pas

function getCombinedVertices(curve, step) {
  const points = []
  for (const curvePart of curve) {
    const controlPoints = curvePart.points
    if (curvePart.type === 'line') {
      points.push(...getSimpleLineSpacedPoints(controlPoints, step))
    } else if (curvePart.type === 'bezier') {
      points.push(...getBernsteinPoints(scene, controlPoints, step))
    }
  }

  const threePoints = points.map((p) => new THREE.Vector3(p.x, p.y, 0))

  return threePoints
}

function getRandomColor() {
  return Math.floor(Math.random() * Math.pow(255, 3))
}

function getShape(points) {
  const shape = new THREE.Shape()
  shape.moveTo(points[0].x, points[0].y)
  for (const p of points) {
    shape.lineTo(p.x, p.y)
  }

  return shape
}

// points: THREE.Vector3[]
function draw3DShapeFromPattern(points, shape) {
  const allObjects = []

  allObjects.push(...drawSpheres(points, yellowMaterial, 0.3))

  const links = [] // {start: Vector3 , end: Vector3}

  const altPoints = []
  for (const point of points) {
    const altPoint = new THREE.Vector3(point.x, point.y, -20)
    altPoints.push(altPoint)

    const linkGeom = new THREE.BufferGeometry().setFromPoints([point, altPoint])
    const link = new THREE.Line(
      linkGeom,
      new THREE.LineBasicMaterial({ color: 0x999999 }),
    )
    scene.add(link)
    allObjects.push(link)

    links.push({ start: point, end: altPoint })
  }

  allObjects.push(...drawSpheres(altPoints, blueMaterial, 0.3))

  for (let i = 0; i < points.length - 1; i++) {
    for (const pointCollection of [points, altPoints]) {
      const a = pointCollection[i]
      const b = pointCollection[i + 1]

      const polyGeom = new THREE.BufferGeometry().setFromPoints([a, b])
      const line = new THREE.Line(
        polyGeom,
        new THREE.LineBasicMaterial({ linewidth: 3, color: getRandomColor() }),
      )
      scene.add(line)
      allObjects.push(line)
    }
  }

  for (let i = 0; i < links.length - 1; i++) {
    const first = links[i]
    const second = links[i + 1]

    const geometry = new THREE.PlaneGeometry(10, 30)
    const material = greenMaterial

    geometry.attributes.position.array[0] = first.start.x
    geometry.attributes.position.array[1] = first.start.y
    geometry.attributes.position.array[2] = first.start.z

    geometry.attributes.position.array[3] = first.end.x
    geometry.attributes.position.array[4] = first.end.y
    geometry.attributes.position.array[5] = first.end.z

    geometry.attributes.position.array[6] = second.start.x
    geometry.attributes.position.array[7] = second.start.y
    geometry.attributes.position.array[8] = second.start.z

    geometry.attributes.position.array[9] = second.end.x
    geometry.attributes.position.array[10] = second.end.y
    geometry.attributes.position.array[11] = second.end.z

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    allObjects.push(mesh)
  }

  if (shape) {
    for (const z of [0, -20]) {
      const geometry = new THREE.ShapeGeometry(shape)
      const material = greenMaterial
      const mesh = new THREE.Mesh(geometry, material)

      mesh.position.z = z
      scene.add(mesh)
      allObjects.push(mesh)
    }
  }

  return allObjects
}

const groups = {
  j: new THREE.Group(),
  un: new THREE.Group(),
  i: new THREE.Group(),
  a: new THREE.Group(),
}

function drawLetterA() {
  const outerA = MAP_JUNIA.aOuter
  const innerA = MAP_JUNIA.aInner

  const verticesOuterA = getCombinedVertices(outerA, STEP)
  const verticesInnerA = getCombinedVertices(innerA, STEP)

  const shapeOuterA = getShape(verticesOuterA)
  const shapeInnerA = getShape(verticesInnerA)

  const innerObjects = draw3DShapeFromPattern(verticesInnerA, null)

  shapeOuterA.holes.push(shapeInnerA)
  const outerObjects = draw3DShapeFromPattern(verticesOuterA, shapeOuterA)

  console.log(shapeOuterA, shapeInnerA)

  return [...innerObjects, ...outerObjects]
}

function drawShapes() {
  const J = MAP_JUNIA
  const fullShapes = {
    j: [J.jBody, J.jPoint],
    un: [J.unBody],
    i: [J.iBody, J.iPoint],
  }

  for (const [key, curves] of Object.entries(fullShapes)) {
    console.log(key, curves)
    for (const curve of curves) {
      const vertices = getCombinedVertices(curve, STEP)
      const shape = getShape(vertices)

      const objects = draw3DShapeFromPattern(vertices, shape)
      console.log(key, '=>', objects)
      for (const obj of objects) {
        groups[key].add(obj)
      }
    }

    scene.add(groups[key])
  }

  console.log(groups)

  const objectsA = drawLetterA() // A

  for (const obj of objectsA) {
    groups.a.add(obj)
  }

  scene.add(groups.a)
}

// Mise à jour notre canvas
export function refreshCanvas() {
  // Supprime tous les elements de la scène et supprime de la mémoire les
  // éléments
  for (const child of scene.children) {
    // Si c'est nos axes, on ne les suprime pas
    if (child == scene.getObjectByName('Axis')) {
      continue
    }

    disposeNode(child)
    scene.remove(child)
  }
}

controls.autoRotate = true

function animate() {

  TWEEN.update()

  const tween = new TWEEN.Tween(greenMaterial.color)
    .to({r: 1, g: 0, b: 1}, 1000)
    .to({r: 0, g: 1, b: 0}, 1000)
    .to({r: 0, g: 0, b: 1}, 1000)
    .yoyo(true)
    .start()

    console.log(tween)
    console.log(greenMaterial.color)


  console.log(TWEEN)
  controls.update()

  console.log(greenMaterial)
  //greenMaterial.color = getRandomColor()

  //greenMaterial.color.r = Math.random()
  //greenMaterial.color.g = Math.random()
  //greenMaterial.color.b = Math.random()

  for (const [key, group] of Object.entries(groups)) {
    //group.scale.x = Math.random() * 2
    //group.scale.y = Math.random() * 2
    //group.scale.z = Math.random() * 2
  }

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

function init() {
  // On dessine et on créer nos axes
  const axisGroup = drawAxisGraduation()
  axisGroup.name = 'Axis'
  scene.add(axisGroup)

  drawShapes()

  // On appelle la fonction une première fois pour initialiser
  animate()
}

init()
