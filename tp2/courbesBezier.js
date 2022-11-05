import { Settings } from './input.js'
import { uuid } from './utils.js'

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

document.addEventListener('pointerdown', e => {
    return;
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    const x = e.pageX - window.innerWidth;
    const y = e.pageY - window.innerHeight;
    sphere.position.x = x;
    sphere.position.y = y;
    scene.add(sphere);
})

const settings = new Settings()

let listOfPoints = [
    { x: 0, y: 0 },
    { x: 0, y: 20 },
    { x: 20, y: 20 },
]

// Renvoie k parmi n
function choose(n, k) {
    if (k === 0) return 1;
    return (n * choose(n - 1, k - 1)) / k;
}

const curveMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff })

const redMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 })

//list of strings of our bernestein polynomes
export const polyNomeBernestein = [];

function bernstein(n, i, t) {
    // i ème polynôme de Bernstein évalué en un t entre 0 et 1
    const bernstein = choose(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
    if ((polyNomeBernestein.length - 1) != n) {
        //Si on reecrit une courbe on efface les anciennes pour la memoire
        if (polyNomeBernestein.curve) {
            polyNomeBernestein.curve.material.dispose();
            polyNomeBernestein.curve.geometry.dispose();
        }



        let bernesteinPolyString = choose(n, i) + " * t^" + i + " * (1-t)^" + (n - i);

        let bernesteinPolyPoints = [];
        for (let t = 0; t <= 1; t += 0.01) {
            let y = choose(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
            bernesteinPolyPoints.push({ x: t, y: y });
        }

        polyNomeBernestein[i] = ({ string: bernesteinPolyString, points: bernesteinPolyPoints });
        //console.table(polyNomeBernestein);
    }
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
    const threePoints = controlPoints.map(e => new THREE.Vector3(e.x, e.y, 0));
    const polyGeom = new THREE.BufferGeometry().setFromPoints(threePoints);
    const controlPolygon = new THREE.Line(polyGeom, controlMaterial);
    scene.add(controlPolygon)
}



function animate() {
    // On demande au naviguateur d'éxecuter cette fonction en continue (60 fois par seconde en général)
    requestAnimationFrame(animate);

    //if (Math.random() < 0.5) return;

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

    const dcPoints = []

    //const max = 0.1

    for (let t = 0; t < max; t += step) {
        //dcPoints.push([]);
        for (let k = 1; k <= n; k++) {
            for (let j = 0; j <= n - k; j++) {
                const x = pointJK(j, k, t, 'x');
                const y = pointJK(j, k, t, 'y');

                dcPoints.push({ x, y })
            }
        }
        //Draw step
    }
    const newPoints = dcPoints.map(e => new THREE.Vector3(e.x, e.y, 0));

    const polyGeom = new THREE.BufferGeometry().setFromPoints(newPoints);

    const curve = new THREE.Line(polyGeom, redMaterial);

    scene.add(curve)

    //console.log(dcPoints)
}


async function animateDeCasteljau(points) {

    for (let i = 0; i < 100; i++) {
        //console.log('animate', i)
        drawDeCasteljau(points, i / 100, 0.1)
        sleep(50)
    }
}


function updateList() {
    document.getElementById("list-points").innerHTML = ""
    for (const p of listOfPoints) {
        let firstTime = false
        if (!p.id) {
            firstTime = true
            p.id = uuid()
        }
        const transformedP = transformPoint(p)
        document.getElementById("list-points").innerHTML += `${p.x} ${p.y} <button id="edit-${p.id}">Modifier</button> <button id="delete-${p.id}">Supprimer</button> Transformé : (${round2(transformedP.x)}, ${round2(transformedP.y)}) <br/>`

    }

    for (const p of listOfPoints) {
        document.getElementById(`delete-${p.id}`).addEventListener('click', () => {
            console.log('delete', p.id)
            deletePoint(p.id)
        })

        document.getElementById(`edit-${p.id}`).addEventListener('click', () => {
            console.log('edit', p.id)
            editPoint(p.id)
        })
    }
}

let editingPointId = null;

function editPoint(id) {
    editingPointId = id;

}

function deletePoint(id) {
    const res = listOfPoints.find(p => p.id == id)
    if (!res) return
    const index = listOfPoints.indexOf(res)
    if (index != -1)
        listOfPoints.splice(index, 1)
    updateList()
    refreshCanvas()
}

// add point
document.getElementById("input-add").addEventListener('click', () => {
    const x = Number(document.getElementById('input-x').value) || 0
    const y = Number(document.getElementById('input-y').value) || 0

    listOfPoints.push({ x, y });

    updateList(listOfPoints)

    refreshCanvas()
})

function addPoint(pos) {
    listOfPoints.push(pos);
    updateList(listOfPoints)
    refreshCanvas()
}


let deCasteljauAnimationState = 0;
let deCasteljauAnimationStateOrder = true;

function disposeNode(child) {
    if (child.geometry)
        child.geometry.dispose()
    if (child.material)
        child.material.dispose()
    if (child.children) {
        for (const subchild of child.children) {
            disposeNode(subchild)
        }
    }
}

export function refreshCanvas() {
    const s = settings;
    //if (s.selectedAlgorithm == 'bernstein' && Math.random() > 0.2) return;

    for (const child of scene.children) {
        if (child == scene.getObjectByName("Axis")) {
            //console.log('ici ça skip', child)
            continue
        }


        disposeNode(child)
        scene.remove(child);
    }

    const transformedPoints = getTransformedList(listOfPoints)
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
        //animateDeCasteljau(transformedPoints)
    }
}

const axisGroup = new THREE.Group();
axisGroup.name = "Axis";
//Draws the axis with graduation 
function drawAxisGraduation() {
    const axisMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const gradSize = 0.15;     //Half of the size of a graduation

    const Xpoints = [];
    const Ypoints = [];

    Xpoints.push(new THREE.Vector3(-window.innerWidth, 0, 0));
    Xpoints.push(new THREE.Vector3(window.innerWidth, 0, 0));
    Ypoints.push(new THREE.Vector3(0, -window.innerHeight, 0));
    Ypoints.push(new THREE.Vector3(0, window.innerHeight, 0));

    const Xgeometry = new THREE.BufferGeometry().setFromPoints(Xpoints);
    const Ygeometry = new THREE.BufferGeometry().setFromPoints(Ypoints);

    const Xline = new THREE.Line(Xgeometry, axisMaterial);
    const Yline = new THREE.Line(Ygeometry, axisMaterial);

    axisGroup.add(Xline);
    axisGroup.add(Yline);


    for (let i = 0; i < window.innerWidth; i++) {
        let gradX = [];
        let gradXNeg = [];

        gradX.push(new THREE.Vector3(i, gradSize, 0));
        gradX.push(new THREE.Vector3(i, -gradSize, 0));
        gradXNeg.push(new THREE.Vector3(-i, gradSize, 0));
        gradXNeg.push(new THREE.Vector3(-i, -gradSize, 0));

        let gradXNegGeo = new THREE.BufferGeometry().setFromPoints(gradXNeg);
        let gradXNegLine = new THREE.Line(gradXNegGeo, axisMaterial);
        let gradXGeo = new THREE.BufferGeometry().setFromPoints(gradX);
        let gradXLine = new THREE.Line(gradXGeo, axisMaterial);


        axisGroup.add(gradXNegLine);
        axisGroup.add(gradXLine);
    }

    for (let i = 0; i < window.innerHeight; i++) {
        let gradY = [];
        let gradYNeg = [];

        gradY.push(new THREE.Vector3(gradSize, i, 0));
        gradY.push(new THREE.Vector3(-gradSize, i, 0));
        gradYNeg.push(new THREE.Vector3(gradSize, -i, 0));
        gradYNeg.push(new THREE.Vector3(-gradSize, -i, 0));

        let gradYNegGeo = new THREE.BufferGeometry().setFromPoints(gradYNeg);
        let gradYNegLine = new THREE.Line(gradYNegGeo, axisMaterial);
        let gradYGeo = new THREE.BufferGeometry().setFromPoints(gradY);
        let gradYLine = new THREE.Line(gradYGeo, axisMaterial);

        axisGroup.add(gradYNegLine);
        axisGroup.add(gradYLine);
    }
    scene.add(axisGroup);
}



function updateAlgo(algo) {
    console.log('updateAlgo', algo)
    document.getElementById(algo).checked = true
    currentMethod = algo
}

refreshCanvas();

function transformPoint(point) {
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

function getTransformedList(original) {
    return original.map(e => {
        return transformPoint(e)
    })
}


updateList(listOfPoints)

function round2(num) {
    return Math.round(num * 100) / 100
}

drawAxisGraduation();
// On appel la fonction une première fois pour initialiser
animate();

setInterval(() => {
    //updateList()
}, 500)

// https://stackoverflow.com/a/56416622
export function clickEventToWorldCoords(e) {
    console.log(e)
    // get x,y coords into canvas where click occurred
    const rect = canvas.getBoundingClientRect(),
        x = e.clientX - rect.left,
        y = e.clientY - rect.top;
    // convert x,y to clip space; coords from top left, clockwise:
    // (-1,1), (1,1), (-1,-1), (1, -1)
    const mouse = new THREE.Vector3();
    mouse.x = ((x / canvas.clientWidth) * 2) - 1;
    mouse.y = (-(y / canvas.clientHeight) * 2) + 1;
    mouse.z = 0.5; // set to z position of mesh objects
    // reverse projection from 3D to screen
    mouse.unproject(camera);
    // convert from point to a direction
    mouse.sub(camera.position).normalize();
    // scale the projected ray
    const distance = -camera.position.z / mouse.z,
        scaled = mouse.multiplyScalar(distance),
        coords = camera.position.clone().add(scaled);
    console.log('coords', coords)
    return coords;
}

export function handleClick(e) {
    const coords = clickEventToWorldCoords(e)
    if (!editingPointId)
        addPoint(coords)
    else {
        const point = listOfPoints.find(e => e.id == editingPointId)
        if (point) {
            point.x = coords.x
            point.y = coords.y
            updateList()
        }
        else {
            addPoint(coords)
        }
    }
}

export function deleteAllPoints() {
    listOfPoints = []
    updateList()
}