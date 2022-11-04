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
	

	constructor() {
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
	}
}
