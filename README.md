# gcode-file
Create and save a gcode file in browser via javascript

```
const { createPath, pathsToPolylines } = require('canvas-sketch-util/penplot');
const GCodeFile = require('./utils/gcode-file');
const gCode = new GCodeFile({
	feedRate: 8000,
	seekRate: 8000,
	onCommand: 'M03S20',
	offCommand: 'M03S0',
	powerDelay: 0.2,
	fileName: 'sketch.gcode',
	drawArea: [210, 297] // A4 size in mm
})

// ... your canvas setup ...
gCode.updateCoordsArea(canvas.width, canvas.height);

const p = createPath();
p.moveTo(10, 10);
p.lineTo(100, 100);

// Converting path to polylines...')
const lines = pathsToPolylines([p]);

console.log('Add data to gcode file...')
gCode.addPolylines(lines)

window.addEventListener('keydown', function(){
  if((event.ctrlKey || event.metaKey) && event.which == 83) {
    event.preventDefault();
    
    console.log('Download file...')
    gCode.downloadFile()
    return false;
  }
})
