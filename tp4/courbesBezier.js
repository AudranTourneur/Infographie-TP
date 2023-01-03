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
export function drawBernstein(scene, points, step = 0.1) {
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

// On dessine la courbe de Bernstein
export function getBernsteinPoints(controlPoints, step = 0.1) {
    const n = controlPoints.length - 1;

    const bezierPoints = []
    // L'algorithme est appliqué pour une échantillonage de t contenant 1/step valeurs
    for (let t = 0; t < 1; t += step) {
        let sumX = 0;
        let sumY = 0;

        // Application des bases de Bernstein de 0 à n
        for (let i = 0; i <= n; i++) {
            sumX += controlPoints[i].x * bernstein(n, i, t)
            sumY += controlPoints[i].y * bernstein(n, i, t)
        }

        // On récolte les points ainsi générés dans un tableau
        bezierPoints.push({
            x: sumX,
            y: sumY,
        })
    }

    // Objets three.js pour le rendu
    const newPoints = bezierPoints.map(e => new THREE.Vector3(e.x, e.y, 0));

    // On renvoie les points générés à la fonction d'appelle sans les afficher pour l'instant
    return newPoints
}