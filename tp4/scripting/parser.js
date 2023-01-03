/*

	Ce fichier est un script qui a été utilisé pour le developpement mais n'est pas nécessaire au lancement du projet final

	Ce fichier convertit un chemin de fichier SVG composé uniquement de segments et de courbes cubiques de Bézier en code
	intégrable dans le reste de notre projet (dossier "generated")

*/


import fs from 'fs'
import parseSVG from 'svg-path-parser'

// Copié depuis "paths.json"
const allPaths = { "j_body": "m 50.6536,84.396449 h 1.887712 l 0.157311,12.506092 c 0,0 -0.943856,1.887712 -1.730404,1.809057 -0.786546,-0.07865 -2.280984,0.07866 -2.280984,0.07866 l -0.235963,-2.123675 1.651746,-0.07865 c 0,0 0.471929,-0.393274 0.471929,-1.258475 0,-0.865201 0.07865,-10.932999 0.07865,-10.932999 z", "un_body": "m 54.979606,84.514432 0.157311,11.011652 c 0,0 1.809057,3.696771 4.955244,2.988878 3.146186,-0.707892 2.674257,-8.258738 2.674257,-8.258738 l 5.033899,8.022775 c 0,0 0.629237,0.314619 1.022511,0.157308 0.393272,-0.157308 0.235964,-13.921875 0.235964,-13.921875 h -2.202331 l 0.07865,8.258739 -4.797935,-7.786809 c 0,0 -1.101164,-0.550585 -1.337128,-0.47193 -0.235966,0.07866 -0.235966,10.697036 -0.235966,10.697036 0,0 -3.224839,3.303494 -3.38215,-1.966368 -0.157308,-5.269862 0.07866,-8.730668 0.07866,-8.730668 z", "i_body": "M 71.339778,98.161016 V 84.475105 l 2.123675,-0.07866 0.07865,13.921875 z", "j_point": "m 50.6536,83.295285 v -1.730401 l 1.730404,0.07865 0.07866,1.651749 z", "i_point": "m 71.339778,83.295285 -0.07865,-1.887712 2.123675,0.07865 0.07865,1.887713 z", "a_outer": "M 75.823092,98.239671 V 87.699947 c 0,0 1.33713,-3.618116 3.539461,-3.460806 2.202331,0.157308 4.168696,2.752913 4.168696,2.752913 l 0.15731,11.247617 -2.123675,-0.07865 -0.07866,-5.269862 -3.460805,1.730401 -0.157308,3.618116 z", "a_inner": "m 78.025423,92.104608 -0.157308,-4.247353 c 0,0 1.022509,-1.415783 1.966365,-1.258475 0.943856,0.157311 1.730404,1.651749 1.730404,1.651749 v 1.966367 z" }

const writeToFs = true
let allStr = ''

for (const [id, path] of Object.entries(allPaths)) {
	const commands = parseSVG(path)
	console.log(commands)

	let cursorPoint = { x: 0, y: 0 }
	let startingPoint = { x: 0, y: 0 }
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
		if (cmd.command === 'moveto') {
			cursorPoint = {
				x: cmd.x,
				y: -cmd.y
			}
			startingPoint = {
				x: cmd.x,
				y: -cmd.y,
			}
		}
		else if (cmd.command === 'horizontal lineto' && cmd.relative) {
			pushToLine()
			const deltaX = Number(cmd.x)
			cursorPoint = { x: cursorPoint.x + deltaX, y: cursorPoint.y }

		}
		else if (cmd.command === 'horizontal lineto' && !cmd.relative) {
			pushToLine()
			cursorPoint = { x: cmd.x, y: cursorPoint.y }
		}
		else if (cmd.command === 'vertical lineto' && cmd.relative) {
			pushToLine()
			const deltaY = -Number(cmd.y)
			cursorPoint = { x: cursorPoint.x, y: cursorPoint.y + deltaY }
		}
		else if (cmd.command === 'vertical lineto' && !cmd.relative) {
			pushToLine()
			cursorPoint = { x: cursorPoint.x, y: -cmd.y }
		}
		else if (cmd.command === 'lineto' && cmd.relative) {
			pushToLine()
			const delta = { x: cmd.x, y: -cmd.y }
			cursorPoint = { x: cursorPoint.x + delta.x, y: cursorPoint.y + delta.y }
		}
		else if (cmd.command === 'curveto') {
			if (cursorCurve && cursorCurve.type === 'line') {
				cursorCurve.points.push(cursorPoint)
				finalCurves.push(cursorCurve)
			}
			cursorCurve = {
				type: 'bezier',
				points: [
					cursorPoint,
					{ x: cursorPoint.x + cmd.x1, y: cursorPoint.y - cmd.y1 },
					{ x: cursorPoint.x + cmd.x2, y: cursorPoint.y - cmd.y2 },
					{ x: cursorPoint.x + cmd.x, y: cursorPoint.y - cmd.y },
				]
			}
			finalCurves.push(cursorCurve)
			cursorPoint = { x: cursorPoint.x + cmd.x, y: cursorPoint.y - cmd.y }
		}
		else if (cmd.command === 'closepath') {
			if (cursorCurve && cursorCurve.type === 'line') {
				cursorCurve.points.push(cursorPoint)
				cursorCurve.points.push(startingPoint)
				finalCurves.push(cursorCurve)
			}
			else if (cursorCurve && cursorCurve.type === 'bezier') {
				cursorCurve = {
					type: 'line',
					points: [cursorPoint, startingPoint]
				}
				finalCurves.push(cursorCurve)
			}
		}
	}
	console.log(JSON.stringify(finalCurves))
	console.log(finalCurves)
	for (const c of finalCurves) {
		console.log(c)
	}
	const currentStr = `const ${id} = ` + JSON.stringify(finalCurves)
	allStr += currentStr + '\n'

	if (writeToFs)
		fs.writeFileSync(`./generated/${id}.txt`, currentStr)
}

if (writeToFs)
	fs.writeFileSync(`./generated/ALL.txt`, allStr)