const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,
    0.5, 1000);

const scene = new THREE.Scene();

// On met la caméra à Z=100 afin de pouvoir observer nos objets
camera.position.z = 100;

// --- PARTIE TRIANGLE ---

// Création d'un matériau de couleur vert
const greenMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 })

// Les points du triangle
const triPoints = [];
triPoints.push(new THREE.Vector3(0, 0, 0));
triPoints.push(new THREE.Vector3(0, 10, 0));
triPoints.push(new THREE.Vector3(10, 10, 0));
triPoints.push(new THREE.Vector3(0, 0, 0));

// Géomtrie du triangle
const triGeometry = new THREE.BufferGeometry().setFromPoints(triPoints);

// Mesh du triangle qui sera affiché
const triangle = new THREE.Line(triGeometry, greenMaterial);

// On l'ajoute à la scène
scene.add(triangle);

// --- PARTIE RECTANGLE ---
// Idem, même logique que pour la partie triangle

const redMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 })

const offsetX = 15
const offsetY = -5
const squarePoints = [];
squarePoints.push(new THREE.Vector3(offsetX - 10, offsetY, 0));
squarePoints.push(new THREE.Vector3(offsetX, offsetY + 10, 0));
squarePoints.push(new THREE.Vector3(offsetX + 10, offsetY, 0));
squarePoints.push(new THREE.Vector3(offsetX, offsetY - 10, 0));
squarePoints.push(new THREE.Vector3(offsetX - 10, offsetY, 0));

const squareGeometry = new THREE.BufferGeometry().setFromPoints(squarePoints);

const rectangle = new THREE.Line(squareGeometry, redMaterial);

scene.add(rectangle)

// On affiche la scène
renderer.render(scene, camera);