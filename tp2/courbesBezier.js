// Instanciation du renderer (moteur de rendu)
const renderer = new THREE.WebGLRenderer();
// On ajoute le moteur au DOM
document.body.appendChild(renderer.domElement);

// On met le renderer à taille de la fenêtre du naviguateur
renderer.setSize(window.innerWidth, window.innerHeight);

// Création d'une caméra (mode perspective) avec arguments respectivement :
// FOV : 45 (field of view, champ de vision) 
// Ratio d'aspect (longueur sur hauteur de la fenêtre)
// "Near": Distance minimale à laquelle les objets seront affichés
// "Far": Distance maximale à laquelle les objets seront affichés
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,
    0.5, 1000);

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
    console.log('click', e)
    console.log(e.pageX, e.pageY)

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    const x = e.pageX - window.innerWidth;
    const y = e.pageY - window.innerHeight;
    sphere.position.x = x;
    sphere.position.y = y;
    scene.add(sphere);
    console.log('adding sphere!', x, y)
})


const listOfPoints = [
    { x: 0, y: 0 },
    { x: 15, y: 20 },
    { x: 20, y: -15 },
    { x: -30, y: -35 },
]

updateList(listOfPoints)

function choose(n, k) {
    if (k === 0) return 1;
    return (n * choose(n - 1, k - 1)) / k;
}

const curveMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff })

const dcMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 })

function drawCurve() {
    const step = 0.01
    const n = listOfPoints.length - 1;

    function bernstein(i, t) {
        // i ème polynôme de Bernstein évalué en un t entre 0 et 1
        const bernstein = choose(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
        return bernstein;
    }

    console.log('LISTE DES POINTS', listOfPoints);

    console.log('n=', n)

    const bezierPoints = []

    for (let t = 0; t < 1; t += step) {
        let sumX = 0;
        let sumY = 0;


        for (let i = 0; i <= n; i++) {
            console.log('i = ', i, 'sur', n)
            sumX += listOfPoints[i].x * bernstein(i, t)
            sumY += listOfPoints[i].y * bernstein(i, t)
        }

        bezierPoints.push({
            x: sumX,
            y: sumY,
        })
        console.log('---')
    }

    console.log(bezierPoints)

    const points = bezierPoints.map(e => new THREE.Vector3(e.x, e.y, 0));

    const polyGeom = new THREE.BufferGeometry().setFromPoints(points);

    const curve = new THREE.Line(polyGeom, curveMaterial);

    scene.add(curve)
}


// Création d'un matériau de couleur vert
const controlMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 })

function animate() {
    // On demande au naviguateur d'éxecuter cette fonction en continue (60 fois par seconde en général)
    requestAnimationFrame(animate);


    // Les points du triangle
    const points = listOfPoints.map(e => new THREE.Vector3(e.x, e.y, 0));

    // Géomtrie du triangle
    const polyGeom = new THREE.BufferGeometry().setFromPoints(points);

    // Mesh du triangle qui sera affiché
    const polygon = new THREE.Line(polyGeom, controlMaterial);

    scene.add(polygon)

    // On fait le rendu graphique à chaque frame puisque l'état du monde a été modifié
    renderer.render(scene, camera);
}

// On appel la fonction une première fois pour initialiser
animate();

function deCasteljau() {

    function pointJK(j, k, t, coords) {
        console.log('point j k t base', j, k, t, coords)
        if (k == 0) return listOfPoints[j][coords];
        return (1 - t) * pointJK(j, k - 1, t, coords) + t * pointJK(j + 1, k - 1, t, coords);
    }


    const n = listOfPoints.length - 1
    const step = 0.05;

    const dcPoints = []

    for (let t = 0; t < 1; t += step) {
        for (let k = 1; k <= n; k++) {
            for (let j = 0; j <= n - k; j++) {
                console.log('j', j, listOfPoints[j])
                const x = pointJK(j, k, t, 'x');
                const y = pointJK(j, k, t, 'y');

                console.log('dc', x, y)
                dcPoints.push({ x, y })
            }
        }
    }

    const points = dcPoints.map(e => new THREE.Vector3(e.x, e.y, 0));

    const polyGeom = new THREE.BufferGeometry().setFromPoints(points);

    const curve = new THREE.Line(polyGeom, dcMaterial);

    scene.add(curve)

    console.log(dcPoints)
}

function updateList() {
    document.getElementById("list-points").innerHTML = ""
    for (const p of listOfPoints) {
        document.getElementById("list-points").innerHTML += `${p.x} ${p.y} <button onclick="editPoint(${p.x}, ${p.y})">Modifier</button> <button onclick="deletePoint(${p.x}, ${p.y})">Supprimer</button> <br/>`
    }
}

function editPoint(x, y) {
    console.log('edit', x, y)

var modal = document.getElementById("modal-edit");
    modal.style.display = "block";
}

function deletePoint(x, y) {
    console.log('delete', x, y)
}

document.getElementById("input-add").addEventListener('click', () => {
    console.log('Clicking button')

    const x = Number(document.getElementById('input-x').value) || 0
    const y = Number(document.getElementById('input-y').value) || 0

    console.log('valeurs de x et y', x, y)


    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.x = x;
    sphere.position.y = y;
    scene.add(sphere);
    console.log('adding sphere!', x, y)

    listOfPoints.push({ x, y });

    updateList(listOfPoints)
})

document.getElementById('input-start').addEventListener('click', e => {
    console.log('start')
    drawCurve();
    deCasteljau()
})

drawCurve();


deCasteljau()

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

    scene.add(Xline);
    scene.add(Yline);

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

        scene.add(gradXNegLine);
        scene.add(gradXLine);
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

        scene.add(gradYNegLine);
        scene.add(gradYLine);
    }
}

function nathanDeCasteljau() {
    let pointsDeConstruction = [];
    let step = 0.1;
    let pointsControl = [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 15, y: 25 }];

    pointsDeConstruction.push(pointsControl);

    for (let t = 0; t < 1; t += step) {

        for (let k = 1; k < pointsControl.length; k++) {
            let newPoints = [{ x: -1, y: -1 }];
            for (let j = 0; j < pointsControl.length - k; j++) {
                newPoints[j] = { x: -1, y: -1 };
                newPoints[j].x = (1 - t) * pointsDeConstruction[k - 1][j].x + t * pointsDeConstruction[k - 1][j + 1].x;
                newPoints[j].y = (1 - t) * pointsDeConstruction[k - 1][j].y + t * pointsDeConstruction[k - 1][j + 1].y;
            }
            pointsDeConstruction.push(newPoints);
        }
    }
    for (const p0 of pointsDeConstruction) {
        console.log('hello', p0[0]);
    }
}

function updateAlgo(algo) {
    console.log('updateAlgo', algo)
    document.getElementById(algo).checked=true
}


//nathanDeCasteljau()

