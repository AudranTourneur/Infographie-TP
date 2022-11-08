import { polyNomeBernestein } from "./courbesBezier.js";
import {disposeNode} from "./utils.js";

const canvas = document.getElementById('canvas-polynomes')
const renderer = new THREE.WebGLRenderer({ canvas });
const w = 200
const h = 200
renderer.setSize(w, h);

// Création d'une caméra (mode perspective) avec arguments respectivement :
// FOV : 45 (field of view, champ de vision) 
// Ratio d'aspect (longueur sur hauteur de la fenêtre)
// "Near": Distance minimale à laquelle les objets seront affichés
// "Far": Distance maximale à laquelle les objets seront affichés
const camera = new THREE.PerspectiveCamera(45, w / h, 0.5, 1000);
camera.position.z = 1.5;
camera.position.x = 0.5;
camera.position.y= 0.5;
camera.lookAt(0.5, 0.5, 0);

// Instanciation de la scène
const scene = new THREE.Scene();

scene.background = new THREE.Color(0.3, 0.3, 0.3);

const redMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 })

function drawbernsteinPoly() {
	polyNomeBernestein.forEach(elt => {
		let bernsteinPolyPoints = []
		elt.points.forEach(e => {
			bernsteinPolyPoints.push(new THREE.Vector3(e.x, e.y, 0))
		})
		const bernsteinGeometry = new THREE.BufferGeometry().setFromPoints(bernsteinPolyPoints);
		const bernsteinCurve = new THREE.Line(bernsteinGeometry, redMaterial);
		scene.add(bernsteinCurve);
	})
}

function refreshCanvas(){
	for(const child of scene.children){
		disposeNode(child);
		scene.remove(child);
	}
	drawbernsteinPoly();
}

setInterval(() => {
	console.log(polyNomeBernestein.length)
	refreshCanvas();
	renderer.render(scene, camera);
}, 1000);