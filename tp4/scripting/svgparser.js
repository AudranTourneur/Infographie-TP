/*

	Ce fichier est un script qui a été utilisé pour le developpement mais n'est pas nécessaire au lancement du projet final

	Le rôle de ce script est de convertir les "paths" d'un fichier SVG en JSON (fichier "paths.json")
*/



import { parse } from 'svg-parser'
import { readFileSync, writeFileSync } from 'fs'


const svgString = readFileSync('./junia.svg', { encoding: 'utf-8' })

console.log(svgString)
const parsed = parse(svgString)

const g = parsed.children[0].children.find(e => e.tagName === 'g')
const paths = g.children
console.log(paths)

let finalObj = {}

for (const path of paths) {
	const id = path.properties.id
	console.log('ID=', id)
	const d = path.properties.d
	finalObj[id] = d
}

writeFileSync('./paths.json', JSON.stringify(finalObj))