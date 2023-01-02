// Renvoie k parmi n
const blueMaterial =
  new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3 });
const redMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const controlMaterial =
  new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 })


export function choose(n, k) {
    if (k === 0) return 1; // Cas de base (une seule manière de choisir 0 éléments)
    return (n * choose(n - 1, k - 1)) / k; // Définition récursive de k parmi n
}

// i ème polynôme de Bernstein évalué en un t entre 0 et 1
function bernstein(n, i, t) {
    //Calcul du polynôme de Bernstein
    const bernstein = choose(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);

    let bernesteinPolyPoints = [];
    for (let t = 0; t <= 1; t += 0.01) {
        // Définition du polynôme de Bernstein, slide 50 du Cours d'Infographie
        let y = choose(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
        bernesteinPolyPoints.push({ x: t, y: y });
    }

    return bernstein;
}

// On dessine la courbe de Bernstein
export function drawBernstein(scene, points) {
    const step = 0.1
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

        // On récolte les points ainsi générés dans un tableau
        bezierPoints.push({
            x: sumX,
            y: sumY,
        })
    }

    // Objets three.js pour le rendu
    const newPoints = bezierPoints.map(e => new THREE.Vector3(e.x, e.y, 0));
    const polyGeom = new THREE.BufferGeometry().setFromPoints(newPoints);
    const curve = new THREE.Line(polyGeom, blueMaterial);

    scene.add(curve)
}

// Dessine notre figure de contrôle
function drawControlPoints(controlPoints) {
    const threePoints = controlPoints.map(e => new THREE.Vector3(e.x, e.y, 0));
    const polyGeom = new THREE.BufferGeometry().setFromPoints(threePoints);
    const controlPolygon = new THREE.Line(polyGeom, controlMaterial);
    scene.add(controlPolygon)
}

//Dessine la methode de Casteljau à un t donné pour un ensemble de points
// Le trosième argument est un booléan spéciafiant si la fonction doit afficher
//    les traits de construction ou pas
function drawDeCasteljauAtT(points, t, drawConstruction) {

    // Calcule le point P, indice J, exposant K de manière récursive 
    function pointJK(j, k, t, coords) {
        if (k == 0) return points[j][coords]; // Cas de base
        // Définition de l'algorithme de De Casteljau, Cours d'Infographie, slide 60
        return (1 - t) * pointJK(j, k - 1, t, coords) + t * pointJK(j + 1, k - 1, t, coords);
    }

    const n = points.length - 1

    // Liste de tableaux de points à relier par un segment
    const listOfGroups = []

    // Calcul tous les points de construction pour le t donné
    for (let k = 1; k <= n; k++) {
        let pointsJ = [];
        for (let j = 0; j <= n - k; j++) {
            const x = pointJK(j, k, t, 'x');
            const y = pointJK(j, k, t, 'y');
            pointsJ.push({ x, y })
        }
        listOfGroups.push(pointsJ)
    }

    //Dessine tous les traits de construction à partir de "listOfGroups"
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

    //Condition de garde pour éviter une erreur à l'éxécution si l'utilisateur spécifie une liste de points vide
    if (listOfGroups[listOfGroups.length - 1])
        return listOfGroups[listOfGroups.length - 1][0];
    else return -1;
}

// Trace l'entiéreté de la courbe de De Casteljau
function drawDeCasteljauCurve(points, step) {
    if (points.length < 3) return; // Courbe non définie si moins de 3 points
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

//Applique toutes les transformés, translation, hométhétie et rotation pour un point {x, y} donné 
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

//Applique la transforme inverse à un point (on l'utilise pour pouvoir ajouter un point lorsque l'utilisateur clique sur le canvas et qu'une transformée est déjà en cours d'application)
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

// Mise à jour notre canvas
export function refreshCanvas() {
    const s = settings;

    // Supprime tous les elements de la scène et supprime de la mémoire les éléments
    for (const child of scene.children) {
        // Si c'est nos axes, on ne les suprime pas 
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