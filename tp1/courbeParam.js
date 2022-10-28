const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,
    0.5, 1000);

const scene = new THREE.Scene();


camera.position.z = 100;

const greenMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff })

// De manière similaire au cercle
function drawCurve() {
    // On procède avec 100 000 étapes
    const steps = 100_000;
    let max = 100;
    const step = max / steps;

    const points = [];

    // Initialisation des constantes
    const a = 8;
    const b = 5;

    // Idem que le cercle avec d'autres équations paramétriques
    for (let t = 0; t < max; t += step) {
        let x = (a + b) * Math.sin(t) - b * Math.sin((a / b + 1) * t);
        let y = (a + b) * Math.cos(t) - b * Math.cos((a / b + 1) * t);

        points.push(new THREE.Vector3(x, y, 0));
    }


    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const curve = new THREE.Line(geometry, curveMaterial);

    scene.add(curve);

}

drawCurve()

renderer.render(scene, camera);
