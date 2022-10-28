renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,
    0.5, 1000);

const scene = new THREE.Scene();

camera.position.z = 100;

const curveMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff })

// Idem que l'exercice précecent, cependant cette fois fonction sera appelé à deux endroits 
// et sert à la fois à l'affichage de la courbe et pour les positions de la sphèere 
function drawCurve() {
    const steps = 100_000;
    let max = 100;
    const step = max / steps;

    const points = [];

    const a = 8;
    const b = 5;

    for (let t = 0; t < max; t += step) {
        let x = (a + b) * Math.sin(t) - b * Math.sin((a / b + 1) * t);
        let y = (a + b) * Math.cos(t) - b * Math.cos((a / b + 1) * t);

        points.push(new THREE.Vector3(x, y, 0));
    }

    return points;
}

// Création de la rosace
const curveGeometry = new THREE.BufferGeometry().setFromPoints(drawCurve());
const curve = new THREE.Line(curveGeometry, curveMaterial);

scene.add(curve);

// Création de la sphère qui se déplacera
const sphereGeometry = new THREE.SphereGeometry(1, 32, 16);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
console.log('spawn sphere', sphere)


const points = drawCurve();

// On sauvegarde à quel endroit la sphère est, cette valeur peut aller de 0 à 99 999 (nombre de points - 1)
let animationState = 0;

function animate() {
    // On demande au naviguateur d'éxecuter cette fonction en continue (60 fois par seconde en général)
    requestAnimationFrame(animate);

    // On met la sphère à la position de l'étal actuel sur la courbe
    sphere.position.x = points[animationState].x;
    sphere.position.y = points[animationState].y;

    // On met à jour l'endroit où la sphère est sur la courbe
    animationState += 30;
 
    // Si jamais on a dépassé, on reviens à zéro
    if (animationState >= points.length) {
        animationState = 0;
    }

    
    // On fait le rendu graphique à chaque frame puisque l'état du monde a été modifié
    renderer.render(scene, camera);
}

// On appel la fonction une première fois pour initialiser
animate();