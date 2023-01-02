import { drawBernstein, getBernsteinPoints } from './courbesBezier.js'
import { TOUTES_LES_COURBES } from './donnnes/data.js'
import { COURBES_JUNIA } from './donnnes/junia.js'
import { updateList } from './gui.js'
import { Settings } from './input.js'
import {
  addToArrayOrCreate,
  choose,
  disposeNode,
  drawAxisGraduation,
} from './utils.js'
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OrbitControls } from 'https://unpkg.com/three@0.119.1/examples/jsm/controls/OrbitControls.js'

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

// Objet qui contient les paramètres spécifiés par l'utilisateur
const settings = new Settings(canvas, camera)

// Définition des matériaux qui seront utilisés plus tard
const blueMaterial = new THREE.LineBasicMaterial({
  color: 0x0000ff,
  linewidth: 3,
})

const redMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 })

const greenMaterial = new THREE.LineBasicMaterial({
  color: 0x00ff00,
  linewidth: 2,
})
const yellowMaterial = new THREE.LineBasicMaterial({
  color: 0xffff00,
  linewidth: 2,
})

const STEP = 0.1

// Liste qui contient les structures de contrôle placées par l'utilisateur
// Par défaut, elle est construite avec c1, c2 et c3
//export let listOfControlStructures = [c1];

const allCurves = COURBES_JUNIA

export let listOfControlStructures = [{ data: [], visible: true }]

function drawSpheres(points, material, radius = 0.2) {
  for (const p of points) {
    const geometry = new THREE.SphereGeometry(radius, 32, 16)
    const sphere = new THREE.Mesh(geometry, material)
    sphere.position.set(p.x, p.y, p.z ?? 0)
    scene.add(sphere)
  }
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
  drawSpheres(points, yellowMaterial, 0.3)
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
    links.push({ start: point, end: altPoint })
  }

  drawSpheres(altPoints, blueMaterial, 0.3)

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
    }
  }

  for (let i = 0; i < links.length - 1; i++) {
    const first = links[i]
    const second = links[i + 1]

    const geometry = new THREE.PlaneGeometry(10, 30)
    const material = new THREE.MeshBasicMaterial({
      color: getRandomColor(),
      //color: 0xff00ff,
      color: 0x792eac,
      side: THREE.DoubleSide,
    })

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
  }

  if (shape) {
    for (const z of [0, -20]) {
      const geometry = new THREE.ShapeGeometry(shape)
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(geometry, material)

      mesh.position.z = z
      console.log(mesh.position)

      scene.add(mesh)
    }
  }
}

function drawLetterA() {
  console.log(allCurves)
  const outerA = allCurves[6]
  const innerA = allCurves[5]

  const verticesOuterA = getCombinedVertices(outerA, STEP)
  const verticesInnerA = getCombinedVertices(innerA, STEP)

  const shapeOuterA = getShape(verticesOuterA)
  const shapeInnerA = getShape(verticesInnerA)

  draw3DShapeFromPattern(verticesInnerA, null)

  shapeOuterA.holes.push(shapeInnerA)
  draw3DShapeFromPattern(verticesOuterA, shapeOuterA)

  console.log(shapeOuterA, shapeInnerA)
}

function drawShapes() {
  const fullShapes = [...allCurves.slice(0, 5)]
  console.log(fullShapes)

  for (const curve of fullShapes) {
    const vertices = getCombinedVertices(curve, STEP)
    const shape = getShape(vertices)
    draw3DShapeFromPattern(vertices, shape)
  }

  drawLetterA()
}

// Mise à jour notre canvas
export function refreshCanvas() {
  const s = settings

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

  drawShapes()
}

let skips = 0

function animate() {
  if (skips % 60 === 0) {
    console.log('CALL')
    refreshCanvas()
  }

  // On fait le rendu graphique à chaque frame puisque l'état du monde a
  // peut-être été modifié
  renderer.render(scene, camera)
  skips++

  // On demande au naviguateur d'éxecuter cette fonction en continue (60 fois
  // par seconde en général)
  requestAnimationFrame(animate)
}

// Première initialisation de notre liste de points à afficher
// updateList(c1)
//updateList(c1)

// On dessine et on créer nos axes
const axisGroup = drawAxisGraduation()
axisGroup.name = 'Axis'
scene.add(axisGroup)

// On appelle la fonction une première fois pour initialiser
animate()

for (const courbe of TOUTES_LES_COURBES) {
  loadCurveFromListOfPoints(courbe)
}
