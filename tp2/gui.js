import { listOfControlStructures, transformPoint, refreshCanvas, inverseTransformPoint } from "./courbesBezier.js"
import { Settings } from "./input.js"
import { uuid, round2 } from './utils.js'
import { clickEventToWorldCoords } from "./utils.js"

/*
// Get the modal
var modal = document.getElementById("modal-edit");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}*/

export function updateList(list) {
  let curve = list.data;
  console.log('yo', list, curve)
  //const curve = new Settings().getCurrentlySelectedCurve(listOfControlStructures)
  //console.log('curve is ', curve)

  document.getElementById("list-points").innerHTML = ""
  for (const p of list.data) {
    let firstTime = false
    if (!p.id) {
      firstTime = true
      p.id = uuid()
    }
    const transformedP = transformPoint(p)
    document.getElementById("list-points").innerHTML += `<div class="badge badge-lg">(X=${round2(p.x)} | Y=${round2(p.y)})</div> <button class="text text-info" id="edit-${p.id}">Modifier</button> <button class="text text-error" id="delete-${p.id}">Supprimer</button> Transformé : (${round2(transformedP.x)}, ${round2(transformedP.y)}) <br/>`

  }

  for (const p of curve) {
    document.getElementById(`delete-${p.id}`).addEventListener('click', () => {
      console.log('delete', p.id)
      deletePoint(p.id)
    })

    document.getElementById(`edit-${p.id}`).addEventListener('click', () => {
      console.log('edit', p.id)
      editPoint(p.id)
    })
  }
}

export function deleteAllPoints() {
  const curve = new Settings().getCurrentlySelectedCurve(listOfControlStructures)
  curve.splice(0, curve.length)
  updateList()
}

export let editingPointId = null;

export function handleClick(e, canvas, camera) {
  const curve = new Settings().getCurrentlySelectedCurve(listOfControlStructures)
  const coords = clickEventToWorldCoords(e, canvas, camera)
  if (!editingPointId)
    addPoint(coords)
  else {
    const point = curve.data.find(e => e.id == editingPointId)
    if (point) {
      point.x = coords.x
      point.y = coords.y
      updateList(curve)
      editingPointId = null
    }
    else {
      addPoint(coords)
    }
  }
}

function addPoint(pos) {
  const curve = new Settings().getCurrentlySelectedCurve(listOfControlStructures)
  curve.data.push(inverseTransformPoint(pos));
  updateList(curve)
  refreshCanvas()
}

function editPoint(id) {
  editingPointId = id;
}

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