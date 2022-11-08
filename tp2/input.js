import { listOfControlStructures } from "./courbesBezier.js"
import { handleClick, deleteAllPoints, updateList, addPoint, updateTransformations } from "./gui.js"

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

// Classe singleton gérant les paramètres de l'utilisateur
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

	selectedAlgorithm = 'decasteljau'

	animationDecasteljau = true

	currentlySelectedTab = 1;

	constructor(canvas, camera) {
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

		document.getElementById('reset-transformation').addEventListener('click', () => {
			this.translationX = 0;
			this.translationY = 0;
			this.scaleFactor = 1;
			this.rotationFactorDeg = 0;
			this.rotationCenterX = 0;
			this.rotationCenterY = 0;
			updateTransformations()
		})

		document.getElementById('div-bernstein').addEventListener('click', () => {
			this.selectedAlgorithm = 'bernstein'
			document.getElementById('radio-bernstein').checked = true
		})

		document.getElementById('div-decasteljau').addEventListener('click', () => {
			this.selectedAlgorithm = 'decasteljau'
			document.getElementById('radio-decastleljau').checked = true
		})

		document.getElementById('animation-decastleljau').addEventListener('click', event => {
			this.animationDecasteljau = event.target.checked
		})

		document.getElementById('canvas').addEventListener('click', event => {
			handleClick(event, canvas, camera)
		})

		document.getElementById('reset-points').addEventListener('click', () => {
			deleteAllPoints()
		})


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

		document.getElementById('is-curve-visible').addEventListener('change', e => {
			const selectedObject = listOfControlStructures[this.currentlySelectedTab - 1]
			selectedObject.visible = e.target.checked
		})

		document.getElementById('input-add').addEventListener('click', event => {
			const x = Number(document.getElementById('input-x').value) || 0
			const y = Number(document.getElementById('input-y').value) || 0
			addPoint({ x, y })
			updateList(this.getCurrentlySelectedCurve())
		})
	}

	getCurrentlySelectedCurveData(listOfCurves) {
		const selected = listOfCurves[this.currentlySelectedTab - 1]
		return selected.data
	}

	getCurrentlySelectedCurve(listOfCurves) {
		const selected = listOfCurves[this.currentlySelectedTab - 1]
		return selected
	}
}