import { FONT_SIZE_DEFAULT, TOP_ROW, SIDE_OFFSET, MENU_Y_START, WORD_OFFSET } from './constants.js'

const ROUND_RECT_RADII = 12


const canvas = document.getElementById('game');
const BACKGROUND_COLOUR = window.getComputedStyle(canvas).getPropertyValue('background-color');
const WORD_COLOUR = "white"


export class TextOnCanvas {
    constructor(ctx, text, x, y, 
            {width=null, isSquare=false, fontsize=FONT_SIZE_DEFAULT, font="Arial", textColour=WORD_COLOUR, disabled=false, clickAnywhere=false}={}) {        
        this.x = x 
        this.y = y 
        this.text = text 
        this.fontsize = fontsize
        this.font = `${fontsize}px ${font}`
        this.isHovered = false
        this.onClickCallback = null // handle clicks
        this.padding = 10
        this.textColour = textColour
        this.disabled = disabled
        this.clickAnywhere = clickAnywhere
        this.isSquare = isSquare

        this.currentInvalidDuration = 0 // ms remaining
        this.maxInvalidDuration = 750

        this.width = width
        this.isSquare = isSquare

        this.setCoords(ctx)
    }

    setCoords(ctx, widthChangeFactor=1, heightChangeFactor=1){
        this.x *= widthChangeFactor
        this.y *= heightChangeFactor
        ctx.save()
        // Set font for measurements
        ctx.font = this.font
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        if (this.width){
            // if width param is set only measure one letter then let the width param decide the width
            const testMetrics = ctx.measureText(this.text[0])
            this.rectWidth = testMetrics.width * this.width + this.padding * 2
        }
        else {
            // otherwise let test size set the width
            const testMetrics = ctx.measureText(this.text)
            this.rectWidth = testMetrics.width + this.padding * 2
        }

        this.rectHeight = this.isSquare ? this.rectWidth : this.fontsize + this.padding * 2
        this.rectX = this.x - (this.rectWidth / 2) 
        this.rectY = this.y 

        ctx.restore()
    }

    onClick(callback) {
        this.onClickCallback = callback
    }

    handleClick() {
        if (this.onClickCallback && !this.disabled) {
            this.onClickCallback()
        }
    }

    setInvalid(duration=this.maxInvalidDuration){
        this.currentInvalidDuration=duration
    }

    isOverlapping(x, y){
        return x > this.rectX && 
                x < this.rectX + this.rectWidth &&
                y > this.rectY && 
                y < this.rectY + this.rectHeight
    }

    setIsHovered(mouse){
        // is the mouse on top of this thing?
        this.isHovered = this.isOverlapping(mouse.x, mouse.y) && !this.disabled && !this.clickAnywhere
    }
    drawWord(ctx, colour) {
        ctx.save()

        ctx.font = this.font
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'

        ctx.fillStyle = colour
        
        const yPos = this.isSquare ? this.y - this.fontsize / 2 + this.rectHeight / 2 : this.y + this.padding

        ctx.fillText(this.text, this.x, yPos)

        ctx.restore()
    }

    draw(ctx) {
        this.drawWord(ctx, this.textColour)
    }

    update(dt) { 
        if (this.currentInvalidDuration > 0) {
            this.currentInvalidDuration -= dt
        }
        else {
            this.currentInvalidDuration = 0
        }
    }
}

export class OutlinedTextOnCanvas extends TextOnCanvas {
    constructor(ctx, text, x, y, 
        {width=null, isSquare=false, fontsize=FONT_SIZE_DEFAULT, font="Arial", textColour=WORD_COLOUR, 
            backgroundColour=BACKGROUND_COLOUR, disabled=false, clickAnywhere=false}={}) { 
        super(ctx, text, x, y, 
            {fontsize: fontsize, font: font, textColour: textColour, width: width, isSquare: isSquare,
                disabled: disabled, clickAnywhere: clickAnywhere})
        this.backgroundColour = backgroundColour
        this.hidden = false
    }

    drawOutlinedWord(ctx, textColour, bgColour) {
        ctx.save()

        ctx.lineWidth = 3

        // background
        ctx.fillStyle = bgColour 
        ctx.beginPath()
        ctx.roundRect(this.rectX, this.rectY, this.rectWidth, this.rectHeight, ROUND_RECT_RADII)
        ctx.fill()

        ctx.restore()
        ctx.save()

        if (this.currentInvalidDuration > 0){
            ctx.fillStyle = `rgba(220, 20, 60, ${this.currentInvalidDuration / this.maxInvalidDuration})`
            // ctx.fillStyle = `rbga(220, 20, 60, "${this.maxInvalidDuration / this.currentInvalidDuration}"`
            ctx.beginPath()
            ctx.roundRect(this.rectX, this.rectY, this.rectWidth, this.rectHeight, ROUND_RECT_RADII)
            ctx.fill()
        }

        ctx.restore()
        ctx.save()

        // outline
        ctx.strokeStyle = this.textColour

        ctx.beginPath()
        ctx.roundRect(this.rectX, this.rectY, this.rectWidth, this.rectHeight, ROUND_RECT_RADII)
        ctx.stroke()


        ctx.restore()

        this.drawWord(ctx, textColour)
    }

    draw(ctx) {
        let textColour = this.isHovered ? this.textColour : this.backgroundColour
        let bgColour = this.isHovered ? this.backgroundColour : this.textColour
        textColour = !this.hidden ? textColour : bgColour

        this.drawOutlinedWord(ctx, textColour, bgColour)
    }
}

export class NumberToMemorize extends OutlinedTextOnCanvas {
    constructor(ctx, text, x, y, {width=null, isSquare=false, fontsize=FONT_SIZE_DEFAULT, font="Arial", disabled=false}={}) {
        super(ctx, text, x, y, {width: width, isSquare: isSquare, fontsize: fontsize, font: font, disabled: disabled})
    }

    getValue(){
        let int = parseInt(this.text)
        if (isNaN(int)){
            console.error(`Error - "${this.text}" is not a number`)
        }
        return int 
    }
}

export class Clock extends TextOnCanvas {
    constructor(ctx, text, x, y, {fontsize=FONT_SIZE_DEFAULT}) {
        super(ctx, text, x, y, 
            {textColour: WORD_COLOUR, disabled: false, fontsize: fontsize})
        this.time_ms = 0
        this.countdown = false
        this.reset()
    }

    reset(resetTime=0) {
        this.time_ms = resetTime
        this.update(0)
    }

    update(dt_ms) {
        if (this.disabled){
            return
        }
        if (this.countdown) {
            this.time_ms -= dt_ms
        }
        // if (this.time_ms <= 1 && this.countdown) {
        //     this.countdown = false
        //     this.time_ms = 0
        // }
        if (!this.countdown) {
            this.time_ms += dt_ms
        }
        this.text = this.clockFromMs(this.time_ms)
    }

    clockFromMs(ms) {
      const hours   = Math.floor(ms / 3600000)
      const minutes = Math.floor((ms % 3600000) / 60000)
      const seconds = Math.floor((ms % 60000) / 1000)
      const millis  = Math.floor((ms % 1000) / 10)
    
      // Pad with leading zeros
      const HH = String(hours).padStart(2, '0')
      const MM = String(minutes).padStart(2, '0')
      const SS = String(seconds).padStart(2, '0')
      const MS = String(millis).padStart(2, '0')  // 3 digits for ms
    
      return `${HH}:${MM}:${SS}:${MS}`
    }

    // getScore() {
    //     return Math.round(100000 / (1000 + this.time_ms))
    // }
}

export class ScoreDisplay extends TextOnCanvas {
    constructor(ctx, x, y, {fontsize=FONT_SIZE_DEFAULT}={}) {
        super(ctx, 0, x, y, 
            {textColour: WORD_COLOUR, backgroundColour: BACKGROUND_COLOUR, disabled: false, fontsize: fontsize})
        this.score = 0
        this.baseScoreIncrement = 50
    }

    incrementScoreFromClock(time_ms){
        this.score += Math.round(this.baseScoreIncrement + this.baseScoreIncrement / ((1000 + time_ms) / 1000))
    }

    update() {
        this.text = `Score: ${this.score}`
    }

    reset(canvas) {
        this.score = 0
        this.x = canvas.width - SIDE_OFFSET
        this.y = TOP_ROW
    }

    centralize(midX) {
        this.x = midX
        this.y = MENU_Y_START + WORD_OFFSET
    }
}
