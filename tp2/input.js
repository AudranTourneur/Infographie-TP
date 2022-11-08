import { listOfControlStructures } from "./courbesBezier.js"
import { handleClick, deleteAllPoints, updateList } from "./gui.js"

//TODO faut checker les inputs pour etre sure que c des nombres
function manageInputGroup(domId, object, prop) {
	const inputBox = document.getElementById(domId)
	const inputSlider = document.getElementById('slider-' + domId)

	inputBox.addEventListener('input', event => {
		object[prop] = Number(event.target.value)
		inputSlider.value = object[prop]
	})

	inputSlider.addEventListener('input', event => {
		object[prop] = Number(event.target.value)
		inputBox.value = object[prop]
	})
}

export class Settings {
	translationX = 0;
	translationY = 0;

	scaleFactor = 1;

	rotationFactorDeg = 0;
	rotationCenterX = 0;
	rotationCenterY = 0;

	selectedAlgorithm = 'bernstein'

	animationDecasteljau = true

	currentlySelectedTab = 1;

	constructor(canvas, camera) {
		if (Settings._instance) {
			return Settings._instance
		}

		Settings._instance = this;

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
			console.log('click', event)
			handleClick(event, canvas, camera)
		})

		document.getElementById('reset-points').addEventListener('click', () => {
			deleteAllPoints()
		})


		const tabs = [1, 2, 3]
		for (const tabId of tabs) {
			document.getElementById(`tab-${tabId}`).addEventListener('click', () => {
				console.log('tab+' + tabId)

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
			console.log('update', selectedObject.visible)
			console.log(selectedObject)
			console.log(listOfControlStructures)
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


export class CurveData {
	points = []
}