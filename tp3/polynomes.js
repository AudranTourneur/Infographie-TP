import { bSplinePolyPoints } from "./courbesBSplines.js";
import { disposeNode } from "./utils.js";

/*
  Ce fichier contient la logique pour l'affichage des polynômes de BSpline en bas à gauche de l'écran
*/

//On recupère les données pour initialiser un deuxieme canvas pour afficher les polynômes de Bernstein
const canvas = document.getElementById('canvas-polynomes')
const renderer = new THREE.WebGLRenderer({ canvas });
const w = 200
const h = 200
renderer.setSize(w, h);

// Comme on travail entre 0 et 1, on met la caméra dans un bonne position pour faciliter la lecture
const camera = new THREE.PerspectiveCamera(45, w / h, 0.5, 1000);
camera.position.z = 1.5;
camera.position.x = 0.5;
camera.position.y = 0.5;
camera.lookAt(0.5, 0.5, 0);

// Instanciation de la scène
const scene = new THREE.Scene();

scene.background = new THREE.Color(0.3, 0.3, 0.3);

const redMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 })

let maxX = 0;
//Dessine les polynômes de BSpline
function drawbernsteinBSpline() {
	bSplinePolyPoints.forEach(elt => {
		let bernsteinPolyPoints = []
		elt.forEach(e => {
			// On transforme notre tableau d'objets JS {x, y} en objets three.js
			bernsteinPolyPoints.push(new THREE.Vector3(e.x, e.y, 0))
			maxX = Math.max(maxX, e.x);
		})
		const filteredPoints = bernsteinPolyPoints.filter(e => !Number.isNaN(e.x) && !Number.isNaN(e.y))
		const bernsteinGeometry = new THREE.BufferGeometry().setFromPoints(filteredPoints);
		const bernsteinCurve = new THREE.Line(bernsteinGeometry, redMaterial);
		scene.add(bernsteinCurve);
	})
}

// Nos fonctions de base vont de 0 à valeur final du vecteur de noeud donc il faut décaler notre caméra pour montrer correctement tout
function resetCamera() {
	let lookAt = (maxX / 2)
	camera.position.x = lookAt;
	camera.position.z = lookAt;
	camera.lookAt(lookAt, 0.5, 0);
}

// Mise à jour du canvas
function refreshCanvas() {
	for (const child of scene.children) {
		disposeNode(child);
		scene.remove(child);
	}
	drawbernsteinBSpline();
}

// On met à jour notre canvas toutes les secondes
setInterval(() => {
	refreshCanvas();
	resetCamera();
	renderer.render(scene, camera);
}, 1000);