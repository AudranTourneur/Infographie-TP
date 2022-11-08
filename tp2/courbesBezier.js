import { Settings } from './input.js'
import { disposeNode, drawAxisGraduation, choose } from './utils.js'
import { updateList } from './gui.js'

/*
  Ce fichier contient la majorité de la logique mathématique pour les courbes de Bézier.
*/

// Instanciation du renderer (moteur de rendu)
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') });


//Création d'un premier canvas principal 
const canvas = document.getElementById('canvas')

//Comme on a un une barre de tache de 25 a droite on change la taille de notre renderer 
const desiredWidth = window.innerWidth * 3 / 4
const desiredHeight = window.innerHeight
renderer.setSize(desiredWidth, desiredHeight);

//Creation de la caméra
const camera = new THREE.PerspectiveCamera(45, desiredWidth / desiredHeight, 0.5, 1000);
camera.position.z = 70;

// Instanciation de la scène
const scene = new THREE.Scene();


// On met la couleur du background à vert (valeurs RGB normalisées entre 0 et 1, la composante verte est à 1, les autres à 0)
scene.background = new THREE.Color(0.3, 0.3, 0.3);


const settings = new Settings(canvas, camera);

// Définition des matériaux qui seront utilisés plus tard
const blueMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3 });
const redMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const controlMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 })

//Liste des polynomes de bernstein qu'on dessine dans le fichier polynomes
export const polynomeBernestein = [];

// Utilisée pour ls animations des traits de construction
let deCasteljauAnimationState = 0;
let deCasteljauAnimationStateOrder = true;


//Données d'initialisation
// Il s'agit des trois polynomes dans le sujet, c1, c2 et c3
const c1X = 10 // Offset en X
const c1Y = 10 // Offset en Y
const c1S = 10 // Scaling
let c1 = {
    data: [
        { x: c1X + 0 * c1S, y: c1Y + 0 * c1S },
        { x: c1X + 0 * c1S, y: c1Y + 1 * c1S },
        { x: c1X + 1 * c1S, y: c1Y + 1 * c1S },
        { x: c1X + 1 * c1S, y: c1Y + 0 * c1S }
    ], visible: true
}


const c2X = -10
const c2Y = 10
const c2S = 10
let c2 = {
    data: [
        { x: c2X + 0 * c2S, y: c2Y + 0 * c2S },
        { x: c2X + 1 * c2S, y: c2Y + 0 * c2S },
        { x: c2X + 0 * c2S, y: c2Y + 1 * c2S },
        { x: c2X + 1 * c2S, y: c2Y + 1 * c2S }
    ], visible: true
}


const c3X = 10
const c3Y = -10
const c3S = 10
let c3 = {
    data: [
        { x: c3X + 0 * c3S, y: c3Y + 0 * c3S },
        { x: c3X + 1 * c3S, y: c3Y + 1 * c3S },
        { x: c3X + 0 * c3S, y: c3Y + 1 * c3S },
        { x: c3X + 1 * c3S, y: c3Y + 0 * c3S }
    ], visible: true
}

// Liste qui contient les structures de contrôle placés par l'utilisateur
// Par défaut, elle est construite avec c1, c2 et c3
export let listOfControlStructures = [c1, c2, c3]


// i ème polynôme de Bernstein évalué en un t entre 0 et 1
function bernstein(n, i, t) {
    //Calcul du polynome de Bernstein
    const bernstein = choose(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
    //On met a jour le polynôme B de Bernestein avec les bonnes valeurs, l'affichage de ce dernier se fait dans polynomes.js
    polynomeBernestein.splice(n);
    let bernesteinPolyString = choose(n, i) + " * t^" + i + " * (1-t)^" + (n - i);

    let bernesteinPolyPoints = [];
    for (let t = 0; t <= 1; t += 0.01) {
        // Définition du polynôme de Bernstein, slide 50 du Cours d'Infographie
        let y = choose(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
        bernesteinPolyPoints.push({ x: t, y: y });
    }

    polynomeBernestein[i] = ({ string: bernesteinPolyString, points: bernesteinPolyPoints });
    return bernstein;
}

// Dessine la courbe de Bernstein
function drawBernstein(points) {
    const step = 0.01
    const n = points.length - 1;

    const bezierPoints = []
    // L'algorithme est appliqué pour une échantillonage de t contenant 1/step valeurs
    for (let t = 0; t < 1; t += step) {
        let sumX = 0;
        let sumY = 0;

        // Application des bases de Bernstein de 0 à n
        for (let i = 0; i <= n; i++) {
            sumX += points[i].x * bernstein(n, i, t)
            sumY += points[i].y * bernstein(n, i, t)
        }

        // On récolte les points ainsi générés
        bezierPoints.push({
            x: sumX,
            y: sumY,
        })
    }

    const newPoints = bezierPoints.map(e => new THREE.Vector3(e.x, e.y, 0));

    const polyGeom = new THREE.BufferGeometry().setFromPoints(newPoints);

    const curve = new THREE.Line(polyGeom, blueMaterial);

    scene.add(curve)
}

//Dessine notre figure de control
function drawControlPoints(controlPoints) {
    const threePoints = controlPoints.map(e => new THREE.Vector3(e.x, e.y, 0));
    const polyGeom = new THREE.BufferGeometry().setFromPoints(threePoints);
    const controlPolygon = new THREE.Line(polyGeom, controlMaterial);
    scene.add(controlPolygon)
}

//Dessine la methode de Casteljau a un t
function drawDeCasteljauAtT(points, t, drawConstruction) {

    // Calcule le point P, indice J, exposant K de manière récursif
    function pointJK(j, k, t, coords) {
        if (k == 0) return points[j][coords]; // Cas de base
        return (1 - t) * pointJK(j, k - 1, t, coords) + t * pointJK(j + 1, k - 1, t, coords);
    }

    const n = points.length - 1
    const listOfGroups = []     //list de list de point à relier avec un segment

    //Calcul tous les points de construction pour le t donne
    for (let k = 1; k <= n; k++) {
        let pointsJ = [];
        for (let j = 0; j <= n - k; j++) {
            const x = pointJK(j, k, t, 'x');
            const y = pointJK(j, k, t, 'y');
            pointsJ.push({ x, y })
        }
        listOfGroups.push(pointsJ)
    }

    //Dessine toutes les lines de construction à partir de list of groups
    for (const group of listOfGroups) {
        if (drawConstruction) {
            if (group.length > 1) {
                const newPoints = group.map(e => new THREE.Vector3(e.x, e.y, 0));
                const polyGeom = new THREE.BufferGeometry().setFromPoints(newPoints);
                const curve = new THREE.Line(polyGeom, redMaterial);
                scene.add(curve)
            }
        }
    }

    //Condition pour eviter de casser notre appli en lisant qlq d'indefini si on supprime tous les points
    if(listOfGroups[listOfGroups.length-1])
        return listOfGroups[listOfGroups.length-1][0];
    else return -1;
}

// Trace l'entiéreté de la courbe de Casteljau
function drawDeCasteljauCurve(points, step) {
    if (points.length < 3) return; // courbe non définie si moins de 3 points
    const finalPoints = []
    let t = 0;
    // Pour plein de valeurs de t allant de 0 à 1 avec un pas de "step"
    while (t < 1) {
        t += step
        finalPoints.push(drawDeCasteljauAtT(points, t, false))
    }

    // Objets three.js
    const newPoints = finalPoints.map(e => new THREE.Vector3(e.x, e.y, 0));
    const polyGeom = new THREE.BufferGeometry().setFromPoints(newPoints);
    const curve = new THREE.Line(polyGeom, blueMaterial);

    scene.add(curve)

}

//Applique toutes les transformés en un seul point
export function transformPoint(point) {
    // Paramètres sélectionnés par l'utilisateur
    const s = settings;
    // Angle en radian 
    const theta = s.rotationFactorDeg * Math.PI / 180;

    // Translation
    const translated = { x: point.x + s.translationX, y: point.y + s.translationY }

    // Hométhétie
    const scaled = { x: translated.x * s.scaleFactor, y: translated.y * s.scaleFactor }

    // Translation vers une nouvelle origine si le centre de rotation n'est pas (0, 0)
    const rotationNormalized = { x: scaled.x - s.rotationCenterX, y: scaled.y - s.rotationCenterY }
    
    // Application d'une matrice de rotation
    // https://en.wikipedia.org/wiki/Rotation_matrix
    const rotated = {
        x: (rotationNormalized.x * Math.cos(theta) - rotationNormalized.y * Math.sin(theta)),
        y: (rotationNormalized.x * Math.sin(theta) + rotationNormalized.y * Math.cos(theta)),
    }

    // On ramène le point après avoir effectué une rotation selon une nouvelle origine
    const rotatedNormal = {
        x: rotated.x + s.rotationCenterX,
        y: rotated.y + s.rotationCenterY,
    }

    // Coordonnées finales
    return rotatedNormal;
}

//Applique la transforme inverse a un point (on l'utilise pour pouvoir ajouter un point lorsque l'utilisateur clic sur le canvas et qu'une transformée est déjà en cours d'application)
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
    const rotationNormalized = { x: rotated.x + s.rotationCenterX, y: rotated.y + s.rotationCenterY }

    const scaled = { x: rotationNormalized.x / s.scaleFactor, y: rotationNormalized.y / s.scaleFactor }

    const translated = { x: scaled.x - s.translationX, y: scaled.y - s.translationY }

    return translated;
}

// Renvoie la liste transformée d'une liste de coordonnés
function getTransformedList(original) {
    return original.map(e => {
        return transformPoint(e)
    })
}

//Met à jour notre canvas
export function refreshCanvas() {
    const s = settings;

    // Supprime tous les elements de la scene et supprime de la mémoire les éléments
    for (const child of scene.children) {
        //Si c'est nos axes, on ne les suprime pas 
        if (child == scene.getObjectByName("Axis")) {
            continue
        }

        disposeNode(child)
        scene.remove(child);
    }

    // On dessine toutes les courbes avec la méthode choisie
    for (const curve of listOfControlStructures) {
        if (!curve.visible) {
            continue;
        }

        const transformedPoints = getTransformedList(curve.data)
        drawControlPoints(transformedPoints);
        if (s.selectedAlgorithm == 'bernstein') {
            // Méthode de Bernstein
            drawBernstein(transformedPoints);
        }
        else if (s.selectedAlgorithm == 'decasteljau') {
            const step = 0.01
            //Animation de casteljau
            if (s.animationDecasteljau) {
                // Courbe entière
                drawDeCasteljauCurve(transformedPoints, step)
                // Animation à un instant t = deCasteljauAnimationState
                drawDeCasteljauAtT(transformedPoints, deCasteljauAnimationState, true)

                //Dans le sens croissant
                if (deCasteljauAnimationStateOrder) {
                    deCasteljauAnimationState += step;
                    if (deCasteljauAnimationState > 1)
                        deCasteljauAnimationStateOrder = false;
                } 
                //Puis dans le sens décroissant
                else {
                    deCasteljauAnimationState -= step;
                    if (deCasteljauAnimationState < 0)
                        deCasteljauAnimationStateOrder = true;
                }
            }
            else {
                // Si l'utilisateur désactive l'animation
                drawDeCasteljauCurve(transformedPoints, step)
            }
        }
    }
}


function animate() {
    // On demande au naviguateur d'éxecuter cette fonction en continue (60 fois par seconde en général)
    requestAnimationFrame(animate);
    refreshCanvas();

    // On fait le rendu graphique à chaque frame puisque l'état du monde a été modifié
    renderer.render(scene, camera);
}

//Première initialisation de notre liste de point à afficher
updateList(c1)

//On dessine et on creer nos axes
const axisGroup = drawAxisGraduation();
axisGroup.name = "Axis";
scene.add(axisGroup);

// On appel la fonction une première fois pour initialiser
animate();