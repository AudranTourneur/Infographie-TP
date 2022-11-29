import { listOfControlStructures } from "./courbesBSplines.js"
import { handleClick, deleteAllPoints, updateList, addPoint, updateTransformations } from "./gui.js"

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
	selectedAlgorithm = 'decasteljau'

	// L'animation de De Casteljau est-elle active ?
	animationDecasteljau = true

	// Onglet actif
	currentlySelectedTab = 1;

	// Le degre de notre Bspline
	degree_algo = 3;

	//Vecteur noeud de notre Bspline
	vecteur_noued_string="[0,1,2,3,4,5]";
	vecteur_noued=[0,1,2,3,4,5];

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
		document.getElementById('div-bernstein').addEventListener('click', () => {
			this.selectedAlgorithm = 'bernstein'
			document.getElementById('radio-bernstein').checked = true
		})

		// Sélection de l'algorithme de De Casteljau
		document.getElementById('div-decasteljau').addEventListener('click', () => {
			this.selectedAlgorithm = 'decasteljau'
			document.getElementById('radio-decastleljau').checked = true
		})

		// Animation
		document.getElementById('animation-decastleljau').addEventListener('click', event => {
			this.animationDecasteljau = event.target.checked
		})

		// Ajout ou modification de points par un clic sur le canvas
		document.getElementById('canvas').addEventListener('click', event => {
			handleClick(event, canvas, camera)
		})

		// Bouton "Supprimer tous les points"
		document.getElementById('reset-points').addEventListener('click', () => {
			deleteAllPoints()
		})
		document.getElementById('degree').addEventListener('change',(event)=>{
			this.degree_algo=event.target.value;
		});
		document.getElementById('vecteur-noeud').addEventListener('change',(event)=>{
			const inputStr = event.target.value;
			const regex = new RegExp(/^((\d+(?:\.\d+)?),?)*$/gm)
			if (regex.test(inputStr)) {
				this.vecteur_noued_string=event.target.value;
				this.convertStringToTab()
			}
		});


		// Gestion des onglets
		const tabs = [1, 2, 3]
		for (const tabId of tabs) {
			document.getElementById(`tab-${tabId}`).addEventListener('click', () => {

				document.getElementById(`tab-${this.currentlySelectedTab}`).classList.toggle('tab-active')
				this.currentlySelectedTab = tabId
				document.getElementById(`tab-${this.currentlySelectedTab}`).classList.toggle('tab-active')

				document.getElementById('title-params').innerText = 'Paramètres de la courbe ' + this.currentlySelectedTab

				document.getElementById('is-curve-visible').checked = listOfControlStructures[this.currentlySelectedTab - 1].visible

				updateList(this.getCurrentlySelectedCurve(listOfControlStructures));
			})
		}

		// Toggle pour afficher ou cacher une courbe
		document.getElementById('is-curve-visible').addEventListener('change', e => {
			const selectedObject = listOfControlStructures[this.currentlySelectedTab - 1]
			selectedObject.visible = e.target.checked
		})

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

	convertStringToTab(){
		let vec=this.vecteur_noued_string.split(',');
		let tmp=[]
		vec.forEach(e=>{
			if (e != '' && Number.isFinite(Number(e)))
				tmp.push(Number(e));
		})
		this.vecteur_noued=tmp;
	}
}