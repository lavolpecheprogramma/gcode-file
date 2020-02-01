const { mapRange } = require('canvas-sketch-util/math')
const {contain} = require('./intrinsic-scale')

const defaultConfig = {
  feedRate: 8000,
  seekRate: 8000,
  onCommand: 'M03S20',
  offCommand: 'M03S0',
  powerDelay: 0.2,
  fileName: 'sketch.gcode',
  paperSize: [210, 297],
  margin: 10
}

class GCodeFile {
  constructor(config) {
    this.config = {
      ...defaultConfig,
      ...config
    }
    this.normalizeMargin()
    this.drawArea = [
      this.config.paperSize[0] - this.config.margin[0] - this.config.margin[2],
      this.config.paperSize[1] - this.config.margin[1] - this.config.margin[3]
    ]
    this.gcode = `G0 F${this.config.seekRate}\nG1 F${this.config.feedRate}\nG90\nG21`
  }

  normalizeMargin(){
    if(typeof this.config.margin === "number"){
      this.config.margin = [this.config.margin,this.config.margin,this.config.margin,this.config.margin]
    }else if(Array.isArray(this.config.margin)){
      if(this.config.margin.length === 2){
        this.config.margin[2] = this.config.margin[0]
        this.config.margin[3] = this.config.margin[1]
      }
    }else{
      throw new Error('Margin option can be a number or an array.')
    }
  }

  updateCoordsArea(width, height) {
    this.coordsWidth = width
    this.coordsHeight = height
    this.updateDrawCoords()
  }

  updateDrawCoords() {
    const {
      offsetX,
      offsetY,
      width,
      height
    } = contain(this.drawArea[0], this.drawArea[1], this.coordsWidth, this.coordsHeight)
    this.offsetX = offsetX
    this.offsetY = offsetY
    this.drawWidth = width
    this.drawHeight = height
  }

  mapCoordsToDrawArea(x, y) {
    if (!this.coordsWidth) {
      throw new Error('Must call "updateCoordsArea" passing width and height of your coordinate system!')
    }
    if (!this.coordsHeight) {
      throw new Error('Must call "updateCoordsArea" passing width and height of your coordinate system!')
    }
    const coords = {
      x: this.config.margin[0] + this.offsetX + mapRange(x, 0, this.coordsWidth, 0, this.drawWidth, true),
      y: this.config.margin[1] + this.offsetY + mapRange(y, 0, this.coordsHeight, 0, this.drawHeight, true)
    }
    
    coords.x = parseFloat(coords.x.toFixed(3))
    coords.y = parseFloat(coords.y.toFixed(3))

    return coords
  }

  moveTo(x, y) {
    const coords = this.mapCoordsToDrawArea(x, y)
    this.gcode += `\n${this.config.offCommand}\nG1 X${coords.x} Y${coords.y}\n${this.config.onCommand}\nG4 P${this.config.powerDelay}`
  }

  drawLine(x, y) {
    const coords = this.mapCoordsToDrawArea(x, y)
    this.gcode += `\nG1 X${coords.x} Y${coords.y}`
  }

  addPolylines(polylines) {
    polylines.forEach(l => {
      l.forEach((point, i) => {
        if (i == 0) {
          this.moveTo(point[0], point[1])
        } else {
          this.drawLine(point[0], point[1])
        }
      })
    })
  }

  closeFile() {
    this.gcode += `\n${this.config.offCommand}\nG1 X0 Y0\nG4 P1\nM18`
  }

  downloadFile() {
    this.closeFile()

    // from https://stackoverflow.com/a/38019175
    const gcodeBlob = new Blob([this.gcode], { type: 'text/plain;charset=utf-8' })
    const gcodeUrl = URL.createObjectURL(gcodeBlob)
    const downloadLink = document.createElement('a')
    downloadLink.href = gcodeUrl
    downloadLink.download = this.config.fileName
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }
}

module.exports = GCodeFile
