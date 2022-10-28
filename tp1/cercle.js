const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,
    0.5, 1000);

const scene = new THREE.Scene();


camera.position.z = 15;

const greenMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff })

const triPoints = [];
triPoints.push(new THREE.Vector3(0, 0, 0));
triPoints.push(new THREE.Vector3(0, 10, 0));
triPoints.push(new THREE.Vector3(10, 10, 0));
triPoints.push(new THREE.Vector3(0, 0, 0));

const triGeometry = new THREE.BufferGeometry().setFromPoints(triPoints);

const triangle = new THREE.Line(triGeometry, greenMaterial);

function drawCurve() {
    // On va échantitionner le cercle en utilisant 1000 points
    const steps = 1000;
    // On met un pas de 2*Pi / 1000
    const step = 2 * Math.PI / steps;

    // Liste de points
    const points = [];

    // On itère 1000 fois en allant de 0 à 2*Pi en allant par pas de 2Pi/1000
    for (let t = 0; t <= 2 * Math.PI; t += step) {
        // À chaque itération, x = 3cos(t) et y = 3cos(y)
        let x = 3 * Math.cos(t);
        let y = 3 * Math.sin(t);

        // On ajoute le point actuel dans la liste
        points.push(new THREE.Vector3(x, y, 0));
    }


    // Instanciation du cercle avec les points déterminés
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const circle = new THREE.Line(geometry, greenMaterial);

    scene.add(circle);

}

drawCurve()

renderer.render(scene, camera);