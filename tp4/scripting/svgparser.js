import { parse } from 'svg-parser'
import { readFileSync, writeFileSync } from 'fs'
import { clone } from 'lodash-es'

const svgString = readFileSync('./junia.svg', { encoding: 'utf-8' })

console.log(svgString)
const parsed = parse(svgString)

const g = parsed.children[0].children.find(e => e.tagName === 'g')
const paths = g.children
console.log(paths)

function parsePoint(str) {
	const [xStr, yStr] = str.split(',')
	return { x: Number(xStr), y: Number(yStr) }
}

let finalObj = {}

for (const path of paths) {

	const id = path.properties.id
	console.log('ID=', id)
	const d = path.properties.d
	finalObj[id] = d
	continue
	console.log(d)

	const commands = d.split(' ')
	console.log(commands)
	let currentCommand = ''

	let cursorPoint = { x: 0, y: 0 }
	let cursorCurve = null

	const finalCurves = []

	function pushToLine() {
		if (!cursorCurve || cursorCurve.type !== 'line') {
			cursorCurve = {
				type: 'line',
				points: []
			}
		}
		
		cursorCurve.points.push(cursorPoint)
	}

	for (const cmd of commands) {
		if (cmd.length === 1) {
			currentCommand = cmd
		}
		else if (currentCommand === 'm') {
			const parsedInit = parsePoint(cmd)
			cursorPoint = {
				x: parsedInit.x,
				y: -parsedInit.y
			}
		}
		else if (currentCommand === 'h') {
			pushToLine()
			const deltaX = Number(cmd)
			cursorPoint = { x: cursorPoint.x + deltaX, y: cursorPoint.y }

		}
		else if (currentCommand === 'v') {

			pushToLine()
			const deltaY = Number(cmd)
			cursorPoint = { x: cursorPoint.x, y: cursorPoint.y - deltaY }
		}
		else if (currentCommand === 'l') {
			pushToLine()
			const delta = parsePoint(cmd)
			cursorPoint = { x: cursorPoint.x + delta.x, y: cursorPoint.y - delta.y }
		}
	}

	finalCurves.push(cursorCurve)

	console.log(JSON.stringify(finalCurves))
	break
}

writeFileSync('./paths.json', JSON.stringify(finalObj))