import { Settings } from './input.js'
import { clickEventToWorldCoords, disposeNode, drawAxisGraduation, choose } from './utils.js'
import { updateList } from './gui.js'

// Instanciation du renderer (moteur de rendu)
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') });
// On ajoute le moteur au DOM
//document.body.appendChild(renderer.domElement);

// On met le renderer à taille de la fenêtre du naviguateur
//renderer.setSize(window.innerWidth, window.innerHeight);
const canvas = document.getElementById('canvas')
console.log('canvas', canvas, canvas.innerWidth)
//renderer.setSize(canvas.offsetWidth, window.innerHeight);

const desiredWidth = window.innerWidth * 3 / 4
const desiredHeight = window.innerHeight

renderer.setSize(desiredWidth, desiredHeight);

// Création d'une caméra (mode perspective) avec arguments respectivement :
// FOV : 45 (field of view, champ de vision) 
// Ratio d'aspect (longueur sur hauteur de la fenêtre)
// "Near": Distance minimale à laquelle les objets seront affichés
// "Far": Distance maximale à laquelle les objets seront affichés
const camera = new THREE.PerspectiveCamera(45, desiredWidth / desiredHeight, 0.5, 1000);

// Instanciation de la scène
const scene = new THREE.Scene();


camera.position.z = 70;

// On met la couleur du background à vert (valeurs RGB normalisées entre 0 et 1, la composante verte est à 1, les autres à 0)
scene.background = new THREE.Color(0.3, 0.3, 0.3);

// On demande à Three.JS de faire le rendu de la scène 
renderer.render(scene, camera);


const sphereGeometry = new THREE.SphereGeometry(1, 32, 16);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });

const settings = new Settings(canvas, camera)

const c1OffsetX = 10
const c1OffsetY = 10
const c1Scale = 10
let c1 = {
    data: [
        { x: c1OffsetX + 0 * c1Scale, y: c1OffsetY + 0 * c1Scale },
        { x: c1OffsetX + 0 * c1Scale, y: c1OffsetY + 1 * c1Scale },
        { x: c1OffsetX + 1 * c1Scale, y: c1OffsetY + 1 * c1Scale },
        { x: c1OffsetX + 1 * c1Scale, y: c1OffsetY + 0 * c1Scale }
    ], visible: true
}

let c2 = {
    data: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 10 },
        { x: 10, y: 10 }
    ], visible: false
}

let c3 = {
    data: [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
        { x: 10, y: 0 }
    ], visible: false
}

export let listOfControlStructures = [c1, c2, c3]

const curveMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff })

const redMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 })

//list of strings of our bernestein polynomes
export const polyNomeBernestein = [];



function bernstein(n, i, t) {
    // i ème polynôme de Bernstein évalué en un t entre 0 et 1
    const bernstein = choose(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
    //if ((polyNomeBernestein.length - 1) != n) {
        polyNomeBernestein.splice(n);
        
        let bernesteinPolyString = choose(n, i) + " * t^" + i + " * (1-t)^" + (n - i);
        let bernesteinPolyPoints = [];
        for (let t = 0; t <= 1; t += 0.01) {
            let y = choose(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
            bernesteinPolyPoints.push({ x: t, y: y });
        }
        polyNomeBernestein[i] = ({ string: bernesteinPolyString, points: bernesteinPolyPoints });
    //}
    return bernstein;
}

function drawBernstein(points) {
    const step = 0.01
    const n = points.length - 1;

    const bezierPoints = []
    for (let t = 0; t < 1; t += step) {
        let sumX = 0;
        let sumY = 0;

        for (let i = 0; i <= n; i++) {
            sumX += points[i].x * bernstein(n, i, t)
            sumY += points[i].y * bernstein(n, i, t)
        }

        bezierPoints.push({
            x: sumX,
            y: sumY,
        })
    }

    const newPoints = bezierPoints.map(e => new THREE.Vector3(e.x, e.y, 0));

    const polyGeom = new THREE.BufferGeometry().setFromPoints(newPoints);

    const curve = new THREE.Line(polyGeom, curveMaterial);

    scene.add(curve)
}

// Création d'un matériau de couleur vert
const controlMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 3 })

function drawControlPoints(controlPoints) {
    const threePoints = controlPoints.map(e =>new THREE.Vector3(e.x, e.y, 0));
    const polyGeom = new THREE.BufferGeometry().setFromPoints(threePoints);
    const controlPolygon = new THREE.Line(polyGeom, controlMaterial);
    scene.add(controlPolygon)
}

function animate() {
    // On demande au naviguateur d'éxecuter cette fonction en continue (60 fois par seconde en général)
    requestAnimationFrame(animate);
    refreshCanvas();

    // On fait le rendu graphique à chaque frame puisque l'état du monde a été modifié
    renderer.render(scene, camera);
}


function drawDeCasteljau(points, max, step) {

    function pointJK(j, k, t, coords) {
        if (k == 0) return points[j][coords];
        return (1 - t) * pointJK(j, k - 1, t, coords) + t * pointJK(j + 1, k - 1, t, coords);
    }

    const n = points.length - 1

    let dcPoints = []

    for (let t = 0; t < max; t += step) {
        //const t = max * step;
        for (let k = 1; k <= n; k++) {
            for (let j = 0; j <= n - k; j++) {
                const x = pointJK(j, k, t, 'x');
                const y = pointJK(j, k, t, 'y');

                dcPoints.push({ x, y })
            }
        }
    }
    const newPoints = dcPoints.map(e => new THREE.Vector3(e.x, e.y, 0));

    const polyGeom = new THREE.BufferGeometry().setFromPoints(newPoints);

    const curve = new THREE.Line(polyGeom, redMaterial);

    scene.add(curve)
}


async function animateDeCasteljau(points) {

    for (let i = 0; i < 100; i++) {
        drawDeCasteljau(points, i / 100, 0.1)
        sleep(50)
    }
}

export let editingPointId = null;

let deCasteljauAnimationState = 0;
let deCasteljauAnimationStateOrder = true;

export function refreshCanvas() {
    const s = settings;

    for (const child of scene.children) {
        if (child == scene.getObjectByName("Axis")) {
            continue
        }

        disposeNode(child)
        scene.remove(child);
    }

    for (const curve of listOfControlStructures) {
        if (!curve.visible) {
            continue;
        }

        const transformedPoints = getTransformedList(curve.data)
        drawControlPoints(transformedPoints);
        if (s.selectedAlgorithm == 'bernstein') {
            drawBernstein(transformedPoints);

        }
        else if (s.selectedAlgorithm == 'decasteljau') {
            const step = 0.025
            if (s.animationDecasteljau) {
                drawDeCasteljau(transformedPoints, deCasteljauAnimationState, step)
                //console.log(deCasteljauAnimationStateOrder)
                if (deCasteljauAnimationStateOrder) {
                    deCasteljauAnimationState += step;
                    if (deCasteljauAnimationState > 1)
                        deCasteljauAnimationStateOrder = false;
                } else {
                    deCasteljauAnimationState -= step;
                    if (deCasteljauAnimationState < 0)
                        deCasteljauAnimationStateOrder = true;
                }
            }
            else {
                drawDeCasteljau(transformedPoints, 1, step)
            }
        }
    }
}

export function transformPoint(point) {
    const s = settings;
    const theta = s.rotationFactorDeg * Math.PI / 180;
    const translated = { x: point.x + s.translationX, y: point.y + s.translationY }
    const scaled = { x: translated.x * s.scaleFactor, y: translated.y * s.scaleFactor }
    const rotationNormalized = { x: scaled.x - s.rotationCenterX, y: scaled.y - s.rotationCenterY }
    const rotated = {
        x: (rotationNormalized.x * Math.cos(theta) - rotationNormalized.y * Math.sin(theta)),
        y: (rotationNormalized.x * Math.sin(theta) + rotationNormalized.y * Math.cos(theta)),
    }
    const rotatedNormal = {
        x: rotated.x + s.rotationCenterX,
        y: rotated.y + s.rotationCenterY,
    }

    return rotatedNormal;
}

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
    const rotationNormalized = { x: rotated.x + s.rotationCenterX, y: rotated.y + s.rotationCenterY }

    const scaled = { x: rotationNormalized.x / s.scaleFactor, y: rotationNormalized.y / s.scaleFactor }

    const translated = { x: scaled.x - s.translationX, y: scaled.y - s.translationY }

    return translated;
}

function getTransformedList(original) {
    return original.map(e => {
        return transformPoint(e)
    })
}

console.log('c1,', c1)
updateList(c1)

const axisGroup = drawAxisGraduation();
axisGroup.name = "Axis";
scene.add(axisGroup);
// On appel la fonction une première fois pour initialiser
animate();

setInterval(() => {
    //updateList()
}, 500)


