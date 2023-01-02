
import { listOfControlStructures, transformPoint, refreshCanvas, inverseTransformPoint } from "./junia2D.js"
import { Settings } from "./input.js"
import { uuid, round2 } from './utils.js'
import { clickEventToWorldCoords } from "./utils.js"

/*
  Ce fichier contient l'ensemble des fonctions relatives à la mise à jour de l'interface des paramètres à gauche de l'écran.
  Il s'agit essentiellement de manipulation du DOM (Document Object Model).
*/
export function afficherPointsConsole(){
  document.getElementById("bouton-sauvegarde").addEventListener('click',()=>{
    let curve=list.data;
    for(let i of curve){
      console.log(i);
    }
  })
}

// Mise à jour de la liste des points
export function updateList(list) {
  let curve = list.data;

  document.getElementById("list-points").innerHTML = ""
  for (const p of list.data) {
    if (!p.id) {
      // Chaque bouton doit avoir un identifiant pour pouvoir attacher un event listener
      // On le crée si c'est la première fois que cette fonction est appelée pour un point donné
      p.id = uuid()
    }
    const transformedPount = transformPoint(p)
    // Mise à jour du HTML
    document.getElementById("list-points").innerHTML += `<div class="badge badge-lg">(X=${round2(p.x)} ; Y=${round2(p.y)})</div> <div class="badge badge-lg">(X=${round2(transformedPount.x)} ; Y=${round2(transformedPount.y)})</div>  <button class="text text-info" id="edit-${p.id}">Modifier</button> <button class="text text-error" id="delete-${p.id}">Supprimer</button><br/><br/>`
  }

  for (const p of curve) {
    // Attachement des event listeners sur les boutons de suppression et de mofification
    document.getElementById(`delete-${p.id}`).addEventListener('click', () => {
      deletePoint(p.id)
    })

    document.getElementById(`edit-${p.id}`).addEventListener('click', () => {
      editPoint(p.id)
    })
  }
}

// Appelé lorsque l'utilisateur clique sur le bouton "Supprimer tous les points"
export function deleteAllPoints() {
  const curve = new Settings().getCurrentlySelectedCurve(listOfControlStructures)
  curve.data.splice(0, curve.data.length)
  updateList(curve)
}

// Point en cours d'édition
export let editingPointId = null;

// Appelé lorsque l'utilisateur clique sur le canvas
export function handleClick(e, canvas, camera) {
  const curve = new Settings().getCurrentlySelectedCurve(listOfControlStructures)
  const coords = clickEventToWorldCoords(e, canvas, camera)
  if (!editingPointId) {
    // Si il n'y a pas de point en cours d'édition, on en ajoute un nouveau là où l'utilisateur a cliqué
    addPoint(coords)
  }
  else {
    const point = curve.data.find(e => e.id == editingPointId)
    if (point) {
      // Un point est en modification, le prochain clic mettra à jour ce point
      point.x = coords.x
      point.y = coords.y
      updateList(curve)
      editingPointId = null
      document.getElementById('edit-waiting').classList.add('hidden')
    }
    else {
      // Ce cas ne devrait pas arriver
      addPoint(coords)
    }
  }
}

// Gère l'ajout d'un point 
export function addPoint(pos) {
  const curve = new Settings().getCurrentlySelectedCurve(listOfControlStructures)
  curve.data.push(inverseTransformPoint(pos));
  updateList(curve)
  refreshCanvas()
}

// Gère la modification d'un point 
function editPoint(id) {
  document.getElementById('edit-waiting').classList.remove('hidden')
  editingPointId = id;
}

// Suppresion d'un point, lorsque l'utilisateur clique sur le bouton "Supprimer" d'un point donné
function deletePoint(id) {
  const curve = new Settings().getCurrentlySelectedCurve(listOfControlStructures)
  const res = curve.data.find(p => p.id == id)
  if (!res) return
  const index = curve.data.indexOf(res)
  if (index != -1)
    curve.data.splice(index, 1)
  updateList(curve)
  refreshCanvas()
}

// Mise à jour des transformations (en bas à gauche)
export function updateTransformations() {
  const s = new Settings()
  for (const prefix of ['', 'slider-']) {
    document.getElementById(prefix + 'translation-x').value = s.translationX
    document.getElementById(prefix + 'translation-y').value = s.translationY
    document.getElementById(prefix + 'scale-factor').value = s.scaleFactor
    document.getElementById(prefix + 'rotation-factor').value = s.rotationFactorDeg
    document.getElementById(prefix + 'rotation-center-x').value = s.rotationCenterX
    document.getElementById(prefix + 'rotation-center-y').value = s.rotationCenterY
  }
}