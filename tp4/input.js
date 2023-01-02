import { getCustomVecNoeudOrDefaultUniformVecNoeudIfNotSet, isCustomVecNoeudValid, listOfControlStructures } from "./junia2D.js"
import { handleClick, deleteAllPoints, updateList, addPoint, updateTransformations,afficherPointsConsole } from "./gui.js"

/*
  Ce fichier contient l'ensemble des fonctions relatives à les récupération des paramètres saisies par l'utilisateur dans l'interface à gauche de l'écran.
  Il s'agit essentiellement d'event listeners attachés à des éléments du DOM.
*/


// Gére les sliders à gauche de l'interface pour les transformations
function manageInputGroup(domId, object, prop) {
	const inputBox = document.getElementById(domId)
	const inputSlider = document.getElementById('slider-' + domId)

	// Event listener pour une input box
	inputBox.addEventListener('input', event => {
		object[prop] = Number(event.target.value)
		inputSlider.value = object[prop]
		updateList(new Settings().getCurrentlySelectedCurve(listOfControlStructures))
	})

	// Event listener pour un slider
	inputSlider.addEventListener('input', event => {
		object[prop] = Number(event.target.value)
		inputBox.value = object[prop]
		updateList(new Settings().getCurrentlySelectedCurve(listOfControlStructures))
	})
}

// Classe singleton gérant les paramètres spécifiés par l'utilisateur
export class Settings {
	// Translations
	translationX = 0;
	translationY = 0;

	// Hométhétie
	scaleFactor = 1;

	// Rotations
	rotationFactorDeg = 0;
	rotationCenterX = 0;
	rotationCenterY = 0;

	// Algorithme en cours d'utilisation
	selectedAlgorithm = 'deboor' // 'deboor' OU 'bspline'
	//selectedAlgorithm = 'bspline' // 'deboor' OU 'bspline'

	// Onglet actif
	currentlySelectedTab = 1;

	// Le degre de notre Bspline
	degreeAlgo = 3;

	//Vecteur noeud de notre Bspline
	vecteurNoeudString = "[0,1,2,3,4,5,6,7,8,9]";
	vecteurNoeud = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

	// Constructeur de la classe dans lequel est déclaré l'ensemble des event listeners
	constructor(canvas, camera) {
		// Singleton pattern
		if (Settings._instance) {
			return Settings._instance
		}

		Settings._instance = this;

		// Initialisation des sliders et des inputs
		manageInputGroup('translation-x', this, 'translationX')
		manageInputGroup('translation-y', this, 'translationY')

		manageInputGroup('scale-factor', this, 'scaleFactor')

		manageInputGroup('rotation-factor', this, 'rotationFactorDeg')
		manageInputGroup('rotation-center-x', this, 'rotationCenterX')
		manageInputGroup('rotation-center-y', this, 'rotationCenterY')

		// Bouton "Remettre à zéro" pour les transformations 
		document.getElementById('reset-transformation').addEventListener('click', () => {
			this.translationX = 0;
			this.translationY = 0;
			this.scaleFactor = 1;
			this.rotationFactorDeg = 0;
			this.rotationCenterX = 0;
			this.rotationCenterY = 0;
			updateTransformations()
		})

		// Sélection de l'algorithme de Bernstein
		document.getElementById('div-bspline').addEventListener('click', () => {
			this.selectedAlgorithm = 'bspline'
			document.getElementById('radio-bspline').checked = true
		})

		// Sélection de l'algorithme de De Casteljau
		document.getElementById('div-deboor').addEventListener('click', () => {
			this.selectedAlgorithm = 'deboor'
			document.getElementById('radio-deboor').checked = true
		})

		// Ajout ou modification de points par un clic sur le canvas
		document.getElementById('canvas').addEventListener('click', event => {
			handleClick(event, canvas, camera)
		})

		// Bouton "Supprimer tous les points"
		document.getElementById('reset-points').addEventListener('click', () => {
			deleteAllPoints()
		})

		function updateWarningVecNoeud() {
			return console.log('removed')
			const warning = document.getElementById('vecnoeud-warning')
			if (!isCustomVecNoeudValid()) {
				warning.classList.remove('hidden')
				document.getElementById('vecnoeud-replace').innerText = '[' + getCustomVecNoeudOrDefaultUniformVecNoeudIfNotSet().join(', ') + ']';
			}
			else {
				warning.classList.add('hidden')

			}
		}

		setTimeout(() => {
			updateWarningVecNoeud();
		}, 1000)

		document.getElementById('degree').addEventListener('change', (event) => {
			this.degreeAlgo = Number(event.target.value);
			console.log('deg=', this.degreeAlgo)
			updateWarningVecNoeud();
		});
		document.getElementById('vecteur-noeud').addEventListener('change', (event) => {
			const inputStr = event.target.value;
			const regex = new RegExp(/^((\d+(?:\.\d+)?),?)*$/gm)
			if (regex.test(inputStr)) {
				this.vecteurNoeudString = event.target.value;
				this.convertStringToTab()
			}


			updateWarningVecNoeud();


		});

		document.getElementById('bouton-sauvegarde').addEventListener('click',()=>{
			let tmp=listOfControlStructures.map(e=>{return e});
			console.log('TMP=',tmp)
			const curve = tmp[0]
			console.log('curve',curve)
			const points = tmp[0].data
			const pointsWithoutId = points.map(e => ({x: e.x, y: e.y}))
			const data = JSON.stringify(pointsWithoutId)
			console.log('data=',data)

			const textarea = document.getElementById('textarea-sauvegarde').value = data
			textarea.select()	
			document.execCommand('Copy')

			
			const c1data = listOfControlStructures[0].data;
			//console.log('oui', c1data)
			let result=tmp.map(e=>{
				return {x:e.x,y:e.y}
			})
			//	console.log( JSON.stringify(tmp));
			//console.log('final', result);
			}
		)

		// Ajout d'un point
		document.getElementById('input-add').addEventListener('click', event => {
			const x = Number(document.getElementById('input-x').value) || 0
			const y = Number(document.getElementById('input-y').value) || 0
			addPoint({ x, y })
			updateList(this.getCurrentlySelectedCurve())
		})
	}

	// Renvoie les données de la courbe sélectionnée
	getCurrentlySelectedCurveData(listOfCurves) {
		const selected = listOfCurves[this.currentlySelectedTab - 1]
		return selected.data
	}

	// Renvoie la courbe sélectionnée
	getCurrentlySelectedCurve(listOfCurves) {
		const selected = listOfCurves[this.currentlySelectedTab - 1]
		return selected
	}

	convertStringToTab() {
		let vec = this.vecteurNoeudString.split(',');
		let tmp = []
		vec.forEach(e => {
			if (e != '' && Number.isFinite(Number(e)))
				tmp.push(Number(e));
		})
		this.vecteurNoeud = tmp;
	}

}