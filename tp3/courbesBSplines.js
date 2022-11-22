import { updateList } from './gui.js'
import { Settings } from './input.js'
import { addToArrayOrCreate, choose, disposeNode, drawAxisGraduation } from './utils.js'

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
camera.position.z = 70;

// Instanciation de la scène
const scene = new THREE.Scene();


// On met la couleur du background à vert (valeurs RGB normalisées entre 0 et 1,
// la composante verte est à 1, les autres à 0)
scene.background = new THREE.Color(0.3, 0.3, 0.3);

// Objet qui contient les paramètres spécifiés par l'utilisateur
const settings = new Settings(canvas, camera);

// Définition des matériaux qui seront utilisés plus tard
const blueMaterial =
    new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3 });
const redMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const controlMaterial =
    new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 })

// Liste des polynômes de Bernstein qu'on dessine dans le fichier polynomes.js
export const bSplinePolyPoints = [];

// Utilisée pour ls animations des traits de construction
let deCasteljauAnimationState = 0;
let deCasteljauAnimationStateOrder = true;


// Données d'initialisation
// Il s'agit des trois polynômes dans le sujet : c1, c2 et c3
const c1X = 10  // Offset en X
const c1Y = 10  // Offset en Y
const c1S = 10  // Scaling
let c1 = {
    data: [
        { x: c1X + 0 * c1S, y: c1Y + 0 * c1S }, { x: c1X + 0 * c1S, y: c1Y + 1 * c1S },
        { x: c1X + 1 * c1S, y: c1Y + 1 * c1S }, { x: c1X + 1 * c1S, y: c1Y + 0 * c1S },
        { x: c1X + 0.5 * c1S, y: c1Y - 1.5 * c1S },
        { x: c1X - 0.5 * c1S, y: c1Y - 1.5 * c1S },
        { x: c1X - 1 * c1S, y: c1Y - 1 * c1S },
    ],
    visible: true
}

const c2X = -10
const c2Y = 10
const c2S = 10
let c2 = {
    data: [
        { x: c2X + 0 * c2S, y: c2Y + 0 * c2S }, { x: c2X + 1 * c2S, y: c2Y + 0 * c2S },
        { x: c2X + 0 * c2S, y: c2Y + 1 * c2S }, { x: c2X + 1 * c2S, y: c2Y + 1 * c2S }
    ],
    visible: false
}


const c3X = 10
const c3Y = -10
const c3S = 10
let c3 = {
    data: [
        { x: c3X + 0 * c3S, y: c3Y + 0 * c3S }, { x: c3X + 1 * c3S, y: c3Y + 1 * c3S },
        { x: c3X + 0 * c3S, y: c3Y + 1 * c3S }, { x: c3X + 1 * c3S, y: c3Y + 0 * c3S }
    ],
    visible: false
}

// Liste qui contient les structures de contrôle placées par l'utilisateur
// Par défaut, elle est construite avec c1, c2 et c3
export let listOfControlStructures = [c1, c2, c3];

function drawPointsBSpline(controlPoints, log) {
    const step = 0.01;      //pas de t 
    //console.log(controlPoints)

    let degre = 3;  // Pour l'instant 3 mais c une donne de l'utilisateur
    let ordre = degre + 1;
    let vecNoeud = [];
    let n = controlPoints.length - 1;  // length des points de controles
    //let nbMorceaux = n - ordre + 2; ai final le nbMorceau est inutile, c'est simplement une manière de voir la chose
    // Noter vecteur de noeud est uniforme peut etre que plus tard on peut le
    // ettre en entree d'utilisateur
    bSplinePolyPoints.splice(n);
    for (let i = 0; i <= n + ordre; i++) vecNoeud.push(i);
    if (log) console.log(vecNoeud);
    //if (log) console.log(controlPoints);
    //if (log) console.log("ordre :", ordre);
    //if (log) console.log("Nbre de points de controle", n);
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
    //if (log) console.log("borne inférieure de t :" + vecNoeud[ordre - 1]);
    //if (log) console.log("borne supérieur de t :", vecNoeud[n + 1]);
    const finalPoints = []  //liste des points finaux de notre courbe de Bspline
    for (let t = vecNoeud[ordre - 1]; t < vecNoeud[n + 1]; t += step) {
        let sumX = 0;
        let sumY = 0;
        for (let i = 0; i < n; i++) {
            let tmp = baseBSpline(degre, t, i);
            sumX += controlPoints[i].x * tmp;
            sumY += controlPoints[i].y * tmp;
        }
        finalPoints.push({ x: sumX, y: sumY })
    }

    let bSpline=[];
    for(let i =0;i<=n;i++){
        bSpline=[];
        if(log) console.log(vecNoeud[0]);
        if(log) console.log(vecNoeud[n+ordre]);
        for(let t_=vecNoeud[0];t_<vecNoeud[n+ordre];t_+=step){
            bSpline.push({x:t_,y:baseBSpline(degre,t_,i)});
        }
        bSplinePolyPoints.push(bSpline);
    }
    const newPoints = finalPoints.map(e => new THREE.Vector3(e.x, e.y, 0));
    const polyGeom = new THREE.BufferGeometry().setFromPoints(newPoints);
    const curve = new THREE.Line(polyGeom,blueMaterial );

    scene.add(curve)

       
}

let deBoorState = 0; // entre 0 et 1
let deBoorStateOrder = 1; // 1 croissant | -1 décroissant

function drawDeBoorAt(controlPoints, k, r, t) {
    const n = controlPoints.length - 1;

    console.log('n', n, 'k', k, 'r', r, 't', t)

    const vecteurDeNoeud = [];
    for (let i = 0; i <= n + k + 1; i++)
        vecteurDeNoeud.push(i);

    function alphaIJ(i, j, tStar) {
        const val = (tStar - vecteurDeNoeud[i]) / (vecteurDeNoeud[i + k - j] - vecteurDeNoeud[i]);
        return val
    }

    const constructionPointsCoords = { x: {}, y: {} };

    function pIJ(i, j, coords, tStar) {
        let valToReturn = 0;
        if (j == 0)
            valToReturn = controlPoints[i][coords];
        else
            valToReturn = (1 - alphaIJ(i, j, tStar)) * pIJ(i - 1, j - 1, coords, tStar) + alphaIJ(i, j, tStar) * pIJ(i, j - 1, coords, tStar);

        //constructionPointsCoords[coords][j].push(valToReturn)
        addToArrayOrCreate(constructionPointsCoords[coords], j, valToReturn);

        return valToReturn;
    }

    const finalPoints = [];

    const step = 0.2;
    const point = {
        x: pIJ(r, k - 1, 'x', t),
        y: pIJ(r, k - 1, 'y', t),
    };
    finalPoints.push(point)

    const newPoints = finalPoints.map(e => new THREE.Vector3(e.x, e.y, 0));
    const polyGeom = new THREE.BufferGeometry().setFromPoints(newPoints);
    const curve = new THREE.Line(polyGeom, blueMaterial);


    scene.add(curve);

    console.log(constructionPointsCoords)

    for (const key of Object.keys(constructionPointsCoords.x)) {

        const constructionPoints = [];
        for (let i = 0; i < constructionPointsCoords.x[key].length; i++) {
            constructionPoints.push(new THREE.Vector3(constructionPointsCoords.x[key][i], constructionPointsCoords.y[key][i], 0));
        }


        const polyGeomConstruction = new THREE.BufferGeometry().setFromPoints(constructionPoints);
        const curveConstruction = new THREE.Line(polyGeomConstruction, redMaterial);
        scene.add(curveConstruction);

    }

}


function updateDeBoorState() {
    const step = 0.005;
    deBoorState += step * deBoorStateOrder;

    if (deBoorState >= 1) {
        deBoorStateOrder = -1
    }
    else if (deBoorState <= 0) {
        deBoorStateOrder = 1;
    }
}

function drawDeBoorAnimated(controlPoints) {
    const k = 4;

    const n = controlPoints.length - 1;

    const minimum = k - 1;
    const maximum = n + 1;

    const vecteurDeNoeud = [];
    for (let i = 0; i <= n + k + 1; i++)
        vecteurDeNoeud.push(i);

    const length = maximum - minimum;
    const currentTime = minimum + deBoorState * length;
    const currentR = Math.floor(currentTime);

    // try/catch pour les valeurs extrêmes
    try {
        drawDeBoorAt(controlPoints, k, currentR, currentTime);
    } catch (e) {
        console.log(e)
        console.warn("Error at :", currentR, currentTime)
    }

    updateDeBoorState();
}

function drawDeBoor(controlPoints) {
    const k = 4; // ordre

    const n = controlPoints.length - 1;

    console.log('n = ', n, 'k', k)

    const vecteurDeNoeud = [];
    for (let i = 0; i <= n + k + 1; i++)
        vecteurDeNoeud.push(i);

    function alphaIJ(i, j, tStar) {
        const val = (tStar - vecteurDeNoeud[i]) / (vecteurDeNoeud[i + k - j] - vecteurDeNoeud[i]);
        return val
    }



    function pIJ(i, j, coords, tStar) {
        if (j == 0)
            return controlPoints[i][coords];

        const val = (1 - alphaIJ(i, j, tStar)) * pIJ(i - 1, j - 1, coords, tStar) + alphaIJ(i, j, tStar) * pIJ(i, j - 1, coords, tStar);

        return val;
    }

    const constructionPoints = [];
    const finalPoints = [];

    const step = 0.2;
    for (let r = k - 1; r < n + 1; r++) {
        for (let t = vecteurDeNoeud[r]; t < vecteurDeNoeud[r + 1]; t += step) {
            const point = {
                x: pIJ(r, k - 1, 'x', t),
                y: pIJ(r, k - 1, 'y', t),
            };
            finalPoints.push(point)
        }
    }

    const newPoints = finalPoints.map(e => new THREE.Vector3(e.x, e.y, 0));
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
    const controlPolygon = new THREE.Line(polyGeom, controlMaterial);
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
    const translated = { x: point.x + s.translationX, y: point.y + s.translationY }

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
//  Il s'agit de l'exact inverse de la fonction transformPoint(point)
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

    // On dessine toutes les courbes avec la méthode choisie
    for (const curve of listOfControlStructures) {
        if (!curve.visible) {
            continue;
        }

        const transformedPoints = getTransformedList(curve.data)
        drawControlPoints(transformedPoints);


    }

    //drawPointsBSpline(c1.data, false);
    drawDeBoor(c1.data);

    drawDeBoorAnimated(c1.data);
}


drawControlPoints(c1.data)
drawPointsBSpline(c1.data, true)


function animate() {
    // On demande au naviguateur d'éxecuter cette fonction en continue (60 fois
    // par seconde en général)
    requestAnimationFrame(animate);
    refreshCanvas();

    // On fait le rendu graphique à chaque frame puisque l'état du monde a
    // peut-être été modifié
    renderer.render(scene, camera);
}

// Première initialisation de notre liste de points à afficher
updateList(c1)

// On dessine et on créer nos axes
const axisGroup = drawAxisGraduation();
axisGroup.name = 'Axis';
scene.add(axisGroup);

// On appelle la fonction une première fois pour initialiser
animate();