const { mapRange } = require('canvas-sketch-util/math')
const {contain} = require('./intrinsic-scale')

const defaultConfig = {
  feedRate: 8000,
  seekRate: 8000,
  onCommand: 'M03S20',
  offCommand: 'M03S0',
  powerDelay: 0.2,
  fileName: 'sketch.gcode',
  drawArea: [190, 267],
}

class GCodeFile {
  constructor(config) {
    this.config = {
      ...defaultConfig,
      ...config
    }
    this.gcode = `G0 F${this.config.seekRate}\nG1 F${this.config.feedRate}\nG90 G21`
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
    } = contain(this.config.drawArea[0], this.config.drawArea[1], this.coordsWidth, this.coordsHeight)
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
    return {
      x: this.offsetX + mapRange(x, 0, this.coordsWidth, 0, this.drawWidth, true),
      y: this.offsetY + mapRange(y, 0, this.coordsHeight, 0, this.drawHeight, true)
    }
  }

  moveTo(x, y) {
    const coords = this.mapCoordsToDrawArea(x, y)
    this.gcode += `\n${this.config.offCommand}\nG1 X${coords.x} Y${coords.y}\nG4 P0.2\n${this.config.onCommand}`
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
    this.gcode += `\n${this.config.offCommand}\nG1 X0 Y0\nM18`
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
