import { polyNomeBernestein } from "./courbesBezier.js";
let poly = polyNomeBernestein;
console.log(poly);

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
camera.lookAt(0.5, 0.5, 0);

// Instanciation de la scène
const scene = new THREE.Scene();

scene.background = new THREE.Color(0.3, 0.3, 0.3);

const redMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 })


const bernsteinCurveGroup = new THREE.Group();
bernsteinCurveGroup.name = "bernsteinCurveGroup";

function drawbernsteinPoly() {
	let bernsteinPolyPoints = []
	poly.forEach(elt => {
		elt.points.forEach(e => {
			bernsteinPolyPoints.push(new THREE.Vector3(e.x, e.y, 0))
		})
	})

	const bernsteinGeometry = new THREE.BufferGeometry().setFromPoints(bernsteinPolyPoints);
	const bernsteinCurve = new THREE.Line(bernsteinGeometry, redMaterial);
	bernsteinCurveGroup.add(bernsteinCurve);

	scene.add(bernsteinCurveGroup);
}

console.log(bernsteinCurveGroup)



function removebernsteinPoly() {
	scene.remove(scene.findObjectByName("bernsteinCurveGroup"));
}

setInterval(() => {
	drawbernsteinPoly();
    
	renderer.render(scene, camera);
}, 1000);