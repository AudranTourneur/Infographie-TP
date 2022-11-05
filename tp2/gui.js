import { listOfPoints, transformPoint, refreshCanvas } from "./courbesBezier.js"
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

export function updateList() {
  document.getElementById("list-points").innerHTML = ""
  for (const p of listOfPoints) {
    let firstTime = false
    if (!p.id) {
      firstTime = true
      p.id = uuid()
    }
    const transformedP = transformPoint(p)
    document.getElementById("list-points").innerHTML += `${p.x} ${p.y} <button id="edit-${p.id}">Modifier</button> <button id="delete-${p.id}">Supprimer</button> Transformé : (${round2(transformedP.x)}, ${round2(transformedP.y)}) <br/>`

  }

  for (const p of listOfPoints) {
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
  listOfPoints = []
  updateList()
}

export let editingPointId = null;

export function handleClick(e, canvas, camera) {
  console.log('ici', camera, canvas)
  const coords = clickEventToWorldCoords(e, canvas, camera)
  if (!editingPointId)
    addPoint(coords)
  else {
    const point = listOfPoints.find(e => e.id == editingPointId)
    if (point) {
      point.x = coords.x
      point.y = coords.y
      updateList()
      editingPointId = null
    }
    else {
      addPoint(coords)
    }
  }
}

function addPoint(pos) {
  listOfPoints.push(pos);
  updateList(listOfPoints)
  refreshCanvas()
}


function editPoint(id) {
  editingPointId = id;
}

function deletePoint(id) {
  const res = listOfPoints.find(p => p.id == id)
  if (!res) return
  const index = listOfPoints.indexOf(res)
  if (index != -1)
    listOfPoints.splice(index, 1)
  updateList()
  refreshCanvas()
}