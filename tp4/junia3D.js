import { drawBernstein, getBernsteinPoints } from './courbesBezier.js';
import { TOUTES_LES_COURBES } from './donnnes/data.js';
import { COURBES_JUNIA } from './donnnes/junia.js';
import { updateList } from './gui.js'
import { Settings } from './input.js'
import { addToArrayOrCreate, choose, disposeNode, drawAxisGraduation } from './utils.js'
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OrbitControls } from 'https://unpkg.com/three@0.119.1/examples/jsm/controls/OrbitControls.js';



//controls.update() must be called after any manual changes to the camera's transform
//camera.position.set(0, 20, 100);
//controls.update();

/*
  Ce fichier contient la majorité de la logique mathématique pour les courbes de
  Bézier.
*/

// Instanciation du renderer (moteur de rendu)
const renderer =
  new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') });


// Création d'un premier canvas principal
const canvas = document.getElementById('canvas')

// Comme on a une barre de tâche de 25% à droite, on change la taille de
// notre renderer
const desiredWidth = window.innerWidth * 3 / 4
const desiredHeight = window.innerHeight
renderer.setSize(desiredWidth, desiredHeight);

// Création de la caméra
const camera =
  new THREE.PerspectiveCamera(45, desiredWidth / desiredHeight, 0.5, 1000);
camera.position.z = 100;

/*
camera.rotation.x = Math.PI / 4
camera.rotation.y = Math.PI
camera.rotation.z = Math.PI / 2

camera.lookAt(0, 0, 0)
*/


// Utilisation de OrbitControls.js (librarie incluse dans three.js)
const controls = new OrbitControls(camera, renderer.domElement);

// Instanciation de la scène
const scene = new THREE.Scene();


scene.background = new THREE.Color(0.3, 0.3, 0.3);

// Objet qui contient les paramètres spécifiés par l'utilisateur
const settings = new Settings(canvas, camera);

// Définition des matériaux qui seront utilisés plus tard
const blueMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3 });

const redMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

const greenMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 })
const yellowMaterial = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 2 })



const STEP = 0.1;


/*
const c1 = {
  data: [
    {x: 0, y: 0},
    {x: 1, y: 1},
    {x: 1, y: 3},
  ],
  visible: false,
}
*/

// Liste qui contient les structures de contrôle placées par l'utilisateur
// Par défaut, elle est construite avec c1, c2 et c3
//export let listOfControlStructures = [c1];

const allCurves = COURBES_JUNIA

export let listOfControlStructures = [{ data: [], visible: true }];



// Dessine une courbe avec les bases de BSpline
function drawPointsBSpline(scene, controlPoints) {
  const step = STEP;  // pas de t
  let degre = settings.degreeAlgo;
  let ordre = degre + 1;
  let vecNoeud = getCustomVecNoeudOrDefaultUniformVecNoeudIfNotSet(controlPoints);
  let n = controlPoints.length - 1;  // length des points de controles



  // Renvoie la base N, indice i, exposant m pour un t donné
  // etape = m
  function baseBSpline(m, t, i) {
    if (m == 0) {
      if (vecNoeud[i] <= t && t < vecNoeud[i + 1])
        return 1;
      else
        return 0;
    }
    return ((t - vecNoeud[i]) / (vecNoeud[i + m] - vecNoeud[i])) *
      baseBSpline(m - 1, t, i) +
      ((vecNoeud[i + m + 1] - t) / (vecNoeud[i + m + 1] - vecNoeud[i + 1])) *
      baseBSpline(m - 1, t, i + 1);
  }
  const finalPoints = []  // liste des points finaux de notre courbe de Bspline
  for (let t = vecNoeud[ordre - 1]; t < vecNoeud[n + 1]; t += step) {
    let sumX = 0;
    let sumY = 0;
    for (let i = 0; i < n; i++) {  // construction des morceaux
      let tmp = baseBSpline(degre, t, i);
      sumX += controlPoints[i].x * tmp;
      sumY += controlPoints[i].y * tmp;
    }
    finalPoints.push({ x: sumX, y: sumY })
  }

  // points finaux à afficher
  const newPoints = finalPoints.map(e => new THREE.Vector3(e.x, e.y, 0));
  const polyGeom = new THREE.BufferGeometry().setFromPoints(newPoints);
  const curve = new THREE.Line(polyGeom, blueMaterial);

  scene.add(curve)
}

let deBoorState = 0;       // entre 0 et 1
let deBoorStateOrder = 1;  // 1 croissant | -1 décroissant


// Dessine les traits de construction de De Boor à un instant t donné
function drawDeBoorAt(controlPoints, k, r, t) {
  const n = controlPoints.length - 1;

  const vecteurDeNoeud = [];
  for (let i = 0; i <= n + k; i++) vecteurDeNoeud.push(i);

  // alpha indicde i, expose j, pour un t donné (récursif)
  function alphaIJ(i, j, tStar) {
    const val = (tStar - vecteurDeNoeud[i]) /
      (vecteurDeNoeud[i + k - j] - vecteurDeNoeud[i]);
    return val
  }

  // Point p d'indice i, d'exposant j, pour un t donné (récursif)
  function pIJ(i, j, coords, tStar) {
    let valToReturn = 0;
    if (j == 0)
      valToReturn = controlPoints[i][coords];
    else
      valToReturn =
        (1 - alphaIJ(i, j, tStar)) * pIJ(i - 1, j - 1, coords, tStar) +
        alphaIJ(i, j, tStar) * pIJ(i, j - 1, coords, tStar);

    return valToReturn;
  }

  // tableau de tableaux pour contenir les traits de construction associés à
  // chaque j
  let jToConstructionPoints = [];

  for (let j = 0; j < k; j++) {
    const debutI = r - k + 1 + j

    jToConstructionPoints[j] = [];

    for (let i = debutI; i <= r; i++) {  // [r-k-1-j]
      const constructionPoint = { x: pIJ(i, j, 'x', t), y: pIJ(i, j, 'y', t) }

      jToConstructionPoints[j]
        .push(constructionPoint);
    }
  }

  // affichage de tous les traits de construction successifs
  let jIndex = 0;
  for (const currentConstructionPoints of jToConstructionPoints) {
    if (jIndex == jToConstructionPoints.length - 1) {  // point final
      const finalPoint = currentConstructionPoints[0];
      const geometry = new THREE.SphereGeometry(.2, 32, 16);
      const sphere = new THREE.Mesh(geometry, redMaterial);
      sphere.position.x = finalPoint.x
      sphere.position.y = finalPoint.y
      scene.add(sphere)
    } else {  // étapes de construction intermédiaires
      const newPoints =
        currentConstructionPoints.map(e => new THREE.Vector3(e.x, e.y, 0));

      const polyGeomConstruction =
        new THREE.BufferGeometry().setFromPoints(newPoints);
      const curveConstruction =
        new THREE.Line(polyGeomConstruction, redMaterial);
      scene.add(curveConstruction);
    }
    jIndex++;
  }
}


// Met à jour l'état de l'animation des pas de construction de De Boor (sens
// croissant puis sens décroissant)
function updateDeBoorState() {
  const step = STEP / 2;
  deBoorState += step * deBoorStateOrder;

  if (deBoorState >= 1) {
    deBoorStateOrder = -1
  } else if (deBoorState <= 0) {
    deBoorStateOrder = 1;
  }
}

// Gère l'animation des traits de construction de la courbe de De Boor
function drawDeBoorAnimated(controlPoints) {
  const k = settings.degreeAlgo + 1;

  const n = controlPoints.length - 1;

  const minimum = k - 1;
  const maximum = n + 1;

  const length = maximum - minimum;
  const currentTime = minimum + deBoorState * length;
  const currentR = Math.floor(currentTime);

  try {
    drawDeBoorAt(controlPoints, k, currentR, currentTime);
  } catch (e) {
  }

  updateDeBoorState();
}

// Dessine la courbe finale selon l'algorithme de De Boor en entier (idem que
// précedemment)
function drawDeBoorStatic(controlPoints) {
  //const k = settings.degreeAlgo + 1;
  const k = 3;

  const n = controlPoints.length - 1;

  //const vecteurDeNoeud = getCustomVecNoeudOrDefaultUniformVecNoeudIfNotSet(controlPoints);
  const vecteurDeNoeud = getUniformVecNoeud(controlPoints)
  console.log('vec', vecteurDeNoeud)


  function alphaIJ(i, j, tStar) {
    const val = (tStar - vecteurDeNoeud[i]) /
      (vecteurDeNoeud[i + k - j] - vecteurDeNoeud[i]);
    return val
  }

  function pIJ(i, j, coords, tStar) {
    if (j == 0) return controlPoints[i][coords];

    const val = (1 - alphaIJ(i, j, tStar)) * pIJ(i - 1, j - 1, coords, tStar) +
      alphaIJ(i, j, tStar) * pIJ(i, j - 1, coords, tStar);

    return val;
  }

  const finalPoints = [];

  const step = STEP;
  for (let r = k - 1; r < n + 1; r++) {
    for (let t = vecteurDeNoeud[r]; t < vecteurDeNoeud[r + 1]; t += step) {
      const point = {
        x: pIJ(r, k - 1, 'x', t),
        y: pIJ(r, k - 1, 'y', t),
      };
      finalPoints.push(point)
    }
  }

  let newPoints = finalPoints.map(e => new THREE.Vector3(e.x, e.y, 0));
  newPoints = newPoints.filter(p => !isNaN(p.x) && !isNaN(p.y));
  const polyGeom = new THREE.BufferGeometry().setFromPoints(newPoints);
  const curve = new THREE.Line(polyGeom, blueMaterial);

  scene.add(curve);
}


// Etape compris entre 0 et n-1
// i compris entre 0 et n-m-1

// Dessine notre figure de contrôle
function drawControlPoints(controlPoints) {
  const threePoints = controlPoints.map(e => new THREE.Vector3(e.x, e.y, 0));
  const polyGeom = new THREE.BufferGeometry().setFromPoints(threePoints);
  const controlPolygon = new THREE.Line(polyGeom, greenMaterial);
  scene.add(controlPolygon)
}

// Applique toutes les transformés, translation, hométhétie et rotation pour un
// point {x, y} donné
export function transformPoint(point) {
  // Paramètres sélectionnés par l'utilisateur
  const s = settings;
  // Angle en radian
  const theta = s.rotationFactorDeg * Math.PI / 180;

  // Translation
  const translated = {
    x: point.x + s.translationX,
    y: point.y + s.translationY
  }

  // Hométhétie
  const scaled = {
    x: translated.x * s.scaleFactor,
    y: translated.y * s.scaleFactor
  }

  // Translation vers une nouvelle origine si le centre de rotation n'est pas
  // (0, 0)
  const rotationNormalized = {
    x: scaled.x - s.rotationCenterX,
    y: scaled.y - s.rotationCenterY
  }

  // Application d'une matrice de rotation
  // https://en.wikipedia.org/wiki/Rotation_matrix
  const rotated = {
    x: (rotationNormalized.x * Math.cos(theta) -
      rotationNormalized.y * Math.sin(theta)),
    y: (rotationNormalized.x * Math.sin(theta) +
      rotationNormalized.y * Math.cos(theta)),
  }

  // On ramène le point après avoir effectué une rotation selon une nouvelle
  // origine
  const rotatedNormal = {
    x: rotated.x + s.rotationCenterX,
    y: rotated.y + s.rotationCenterY,
  }

  // Coordonnées finales
  return rotatedNormal;
}

// Applique la transforme inverse à un point (on l'utilise pour pouvoir ajouter
// un point lorsque l'utilisateur clique sur le canvas et qu'une transformée est
// déjà en cours d'application)
// Il s'agit de l'exact inverse de la fonction transformPoint(point)
export function inverseTransformPoint(point) {
  const s = settings;
  const theta = s.rotationFactorDeg * Math.PI / 180;

  const rotatedNormal = {
    x: point.x - s.rotationCenterX,
    y: point.y - s.rotationCenterY,
  }

  const rotated = {
    x: (rotatedNormal.x * Math.cos(theta) + rotatedNormal.y * Math.sin(theta)),
    y: (rotatedNormal.x * -Math.sin(theta) + rotatedNormal.y * Math.cos(theta)),
  }

  const rotationNormalized = {
    x: rotated.x + s.rotationCenterX,
    y: rotated.y + s.rotationCenterY
  }

  const scaled = {
    x: rotationNormalized.x / s.scaleFactor,
    y: rotationNormalized.y / s.scaleFactor
  }

  const translated = {
    x: scaled.x - s.translationX,
    y: scaled.y - s.translationY
  }

  return translated;
}

// Renvoie la liste transformée d'une liste de coordonnés
function getTransformedList(original) {
  return original.map(e => { return transformPoint(e) })
}

function drawSpheres(points, material, radius = .2) {
  for (const p of points) {
    const geometry = new THREE.SphereGeometry(radius, 32, 16);
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(p.x, p.y, p.z ?? 0)
    scene.add(sphere);
  }
}

// Lie les points passés en paramètre par des traits
function drawSimpleCurve(points) {
  const newPoints = points.map(e => new THREE.Vector3(e.x, e.y, 0));
  const polyGeom = new THREE.BufferGeometry().setFromPoints(newPoints);
  const curve = new THREE.Line(polyGeom, blueMaterial);

  scene.add(curve);

  /*
  const altPoints = points.map(e => new THREE.Vector3(e.x, e.y, 20));
  const altGeom = new THREE.BufferGeometry().setFromPoints(altPoints);
  const altCurve = new THREE.Line(altGeom, blueMaterial);

  scene.add(altCurve)

  for (let i = 0; i < newPoints.length; i++) {
    const a = newPoints[i]
    const b = altPoints[i]
    const link = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b], redMaterial))
    scene.add(link)
  }
  */
}

function getSimpleLineSpacedPoints(controlPoints, step) {
  if (controlPoints.length < 2) throw Error('Impossible de générer un ensemble de segments avec moins de 2 points')
  const finalPoints = []
  for (let i = 0; i < controlPoints.length - 1; i++) {
    const startPoint = controlPoints[i]
    const endPoint = controlPoints[i + 1]

    const deltaVector = {
      x: (endPoint.x - startPoint.x),
      y: (endPoint.y - startPoint.y)
    }

    for (let j = 0; j <= 1; j += step) {
      finalPoints.push(({
        x: startPoint.x + j * deltaVector.x,
        y: startPoint.y + j * deltaVector.y
      }))
    }
  }
  return finalPoints
}

// Renvoie l'ensemble des sommets espacés d'un certain pas

function getCombinedVertices(curve, step = 0.2) {
  const points = []
  for (const curvePart of curve) {
    const controlPoints = curvePart.points
    if (curvePart.type === 'line') {
      points.push(...getSimpleLineSpacedPoints(controlPoints, step))
    }
    else if (curvePart.type === 'bezier') {
      points.push(...getBernsteinPoints(scene, controlPoints, step))
    }
  }

  const threePoints = points.map(p => new THREE.Vector3(p.x, p.y, 0))

  return threePoints
}

function getRandomColor() {
  return Math.floor(Math.random() * Math.pow(255, 3))
}

// points: THREE.Vector3[]
function draw3DShapeFromPattern(points) {
  //console.log(points)

  const altPoints = []
  for (const point of points) {
    const altPoint = new THREE.Vector3(point.x, point.y, -20)
    altPoints.push(altPoint)

    const linkGeom = new THREE.BufferGeometry().setFromPoints([point, altPoint])
    const link = new THREE.Line(linkGeom, new THREE.LineBasicMaterial({ color: 0x999999 }))
    scene.add(link)
  }

  console.log('1',points)
  console.log('2',altPoints)

  for (let i = 0; i < points.length - 1; i++) {
    for (const pointCollection of [points]) {
      const a = pointCollection[i]
      const b = pointCollection[i + 1]

      //console.log('A/B', a, b)
      const polyGeom = new THREE.BufferGeometry().setFromPoints([a, b]);
      const line = new THREE.Line(polyGeom, new THREE.LineBasicMaterial({ linewidth: 3, color: getRandomColor() }));
      scene.add(line)
    }


  }




}

// Mise à jour notre canvas
export function refreshCanvas() {
  const s = settings;

  // Supprime tous les elements de la scène et supprime de la mémoire les
  // éléments
  for (const child of scene.children) {
    // Si c'est nos axes, on ne les suprime pas
    if (child == scene.getObjectByName('Axis')) {
      continue
    }

    disposeNode(child)
    scene.remove(child);
  }

  //console.log(getCombinedVertices(allCurves[1]))

  for (const curve of allCurves) {
    const vertices = getCombinedVertices(curve, .2)
    //drawSpheres(vertices, yellowMaterial, .2)
    draw3DShapeFromPattern(vertices)
    /*
    for (const curvePart of curve) {
      //acc += curvePart.points.length
      //console.log(curvePart.points)
      drawSpheres(curvePart.points, curvePart.type === 'line' ? greenMaterial : redMaterial)
      if (curvePart.type === 'line') {
        drawSimpleCurve(curvePart.points)
      }
      else if (curvePart.type === 'bezier') {
        drawBernstein(scene, curvePart.points)
      }
    }
    */
  }
}

let skips = 0

function animate() {
  if (skips % 60 === 0) {
    console.log('CALL')
    refreshCanvas();

  }


  // On fait le rendu graphique à chaque frame puisque l'état du monde a
  // peut-être été modifié
  renderer.render(scene, camera);
  skips++

  // On demande au naviguateur d'éxecuter cette fonction en continue (60 fois
  // par seconde en général)
  requestAnimationFrame(animate);
}


// Première initialisation de notre liste de points à afficher
// updateList(c1)
//updateList(c1)


// On dessine et on créer nos axes
const axisGroup = drawAxisGraduation();
axisGroup.name = 'Axis';
scene.add(axisGroup);

// On appelle la fonction une première fois pour initialiser
animate();

// renvoie true si le vecteur de noeud saisie par l'utilisateur est valide,
// false sinon
export function isCustomVecNoeudValid(controlPoints) {

  //const curve = settings.getCurrentlySelectedCurve(listOfControlStructures);
  const n = controlPoints.length - 1;   // nombre de points de contrôles - 1
  const k = settings.degreeAlgo;  // degré choisie par l'utilisateur
  const vecNoeudLen = settings.vecteurNoeud.length;

  if (vecNoeudLen < n + k) {
    return false;
  }

  for (let i = 0; i < vecNoeudLen - 1; i++) {
    if (settings.vecteurNoeud[i + 1] < settings.vecteurNoeud[i]) {
      return false;
    }
  }

  return true;
}

function getUniformVecNoeud(controlPoints) {
  const n = controlPoints.length - 1;  // nombre de points de contrôles - 1
  const k = settings.degreeAlgo;    // deg
  const defaultVecNoeudUniform =
    Array.from(Array(n + k + 1).keys());  // [0, 1, ..., n + k - 1, n + k]
  return defaultVecNoeudUniform;
}

// Si le vecteur de noeud saisie par l'utilisateur est valide, celui-ci est
// renvoyé, autrement un vecteur de noeud uniforme conforme vis-à-vis des
// paramètres saisie est renvoyé par défaut
export function getCustomVecNoeudOrDefaultUniformVecNoeudIfNotSet(controlPoints) {
  //const curve = settings.getCurrentlySelectedCurve(listOfControlStructures);
  const n = controlPoints.length - 1;  // nombre de points de contrôles - 1
  const k = settings.degreeAlgo;    // degré choisie par l'utilisateur

  if (isCustomVecNoeudValid(controlPoints)) {
    return settings.vecteurNoeud;
  } else {
    const defaultVecNoeudUniform =
      Array.from(Array(n + k + 1).keys());  // [0, 1, ..., n + k - 1, n + k]
    return defaultVecNoeudUniform;
  }
}


// Import de nos modèles

function loadCurveFromListOfPoints(courbe) {
  listOfControlStructures.push({
    data: courbe.points.map(p => ({ x: p.x + courbe.offset.x, y: p.y + courbe.offset.y })),
    visible: true,
  })
}

for (const courbe of TOUTES_LES_COURBES) {
  loadCurveFromListOfPoints(courbe)
}

