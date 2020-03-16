# gcode-file

Create and save a gcode file in browser via javascript

### Installation

You can grab it as an `npm` package
```bash
npm i --save @gcode-file
```

### Example

```
const { createPath, pathsToPolylines } = require('canvas-sketch-util/penplot');
const GCodeFile = require('gcode-file');
const gCode = new GCodeFile({
	feedRate: 8000,
	seekRate: 8000,
	onCommand: 'M03S20',
	offCommand: 'M03S0',
	powerDelay: 0.2,
	fileName: 'sketch',
	paperSize: [210, 297], // A4 size in mm
	margin: 10,
	flipX: false,
	flipY: false
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
```

## Methods

### updateConfig(newConfig)
Accepts an object with the new config (or a part of it). It is useful if you modify your sketch size or print settings at runtime with a gui for example.

### updateCoordsArea(width, height)
Update the dimension of your drawing area. It is necessary to know how map the coordinates of your paths to the paper dimension.

### moveTo(x, y)
Wrap all the command to move the plot without draw

### drawLine(x, y)
Wrap all the command to move the plot drawing

### addPolylines(polylines)
Accepts an array on polylines and generate all the commands to draw the polylines.

### addLayer(name)
Add layer that will be saved on separate file.

### downloadFile()
Generate and download the gcode file





