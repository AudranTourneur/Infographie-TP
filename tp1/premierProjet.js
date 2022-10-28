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

// On met la couleur du background à vert (valeurs RGB normalisées entre 0 et 1, la composante verte est à 1, les autres à 0)
scene.background = new THREE.Color(0, 1, 0);

// On demande à Three.JS de faire le rendu de la scène 
renderer.render(scene, camera);