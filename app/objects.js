const ROUND_RECT_RADII = 12


const canvas = document.getElementById('game');
const BACKGROUND_COLOR = window.getComputedStyle(canvas).getPropertyValue('background-color');
const WORD_COLOUR = "white"


export class TextOnCanvas {
    constructor(ctx, text, x, y, 
            {width=null, fontsize=24, font="Arial", colour=WORD_COLOUR, disabled=false, clickAnywhere=false}={}) {        
        this.x = x 
        this.y = y 
        this.text = text 
        this.fontsize = fontsize
        this.font = `${fontsize}px ${font}`
        this.isHovered = false
        this.onClickCallback = null // handle clicks
        this.mouseHeldDownOn = false
        this.padding = 10
        this.colour1 = colour
        this.disabled = disabled
        this.clickAnywhere = clickAnywhere
        
        this.currentInvalidDuration = 0 // ms remaining
        this.maxInvalidDuration = 750

        ctx.save()
        // Set font for measurements
        ctx.font = this.font
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        if (width){
            // if width param is set only measure one letter then let the width param decide the width
            const testMetrics = ctx.measureText(this.text[0])
            this.rectWidth = testMetrics.width * width + this.padding * 2
        }
        else {
            // otherwise let test size set the width
            const testMetrics = ctx.measureText(this.text)
            this.rectWidth = testMetrics.width + this.padding * 2
        }

        this.rectHeight = this.fontsize + this.padding * 2
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

    isOverlapping(x, y, ctx=null){
        // console.log("x", x)
        // console.log("y", y)
        // console.log("this.rectX", this.rectX)
        // console.log("this.rectWidth", this.rectWidth)
        // console.log("this.rectY", this.rectY)
        // console.log("this.rectHeight", this.rectHeight)

        if (ctx){
            ctx.save()  
            console.log(x, y, canvas)
            ctx.beginPath()
            ctx.fillStyle = "green"
            ctx.fillRect(x, y, 2, 2)
            ctx.restore()
        }

        return x > this.rectX && 
                x < this.rectX + this.rectWidth &&
                y > this.rectY && 
                y < this.rectY + this.rectHeight
    }

    setIsHovered(mouse){
        // is the mouse on top of this thing?
        this.isHovered = this.isOverlapping(mouse.x, mouse.y) && !this.disabled && !this.clickAnywhere
    }
// this.isHovered ? "black" : "white"
    drawWord(ctx, colour) {
        ctx.save()

        ctx.font = this.font
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'

        ctx.fillStyle = colour

        ctx.fillText(this.text, this.x, this.y + this.padding)

        ctx.restore()
    }

    draw(ctx) {
        this.drawWord(ctx, this.colour1)
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
        {width=null, fontsize=24, font="Arial", colour1=WORD_COLOUR, colour2=BACKGROUND_COLOR, 
            disabled=false, clickAnywhere=false}={}) {
        super(ctx, text, x, y, 
            {fontsize: fontsize, font: font, colour1: colour1, width: width, 
                disabled: disabled, clickAnywhere: clickAnywhere})
        this.colour2 = colour2
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
        // let outlineAndTextColour = !this.hidden ? colour1 : colour2
        // ctx.strokeStyle = textColour
        ctx.strokeStyle = this.colour1

        ctx.beginPath()
        ctx.roundRect(this.rectX, this.rectY, this.rectWidth, this.rectHeight, ROUND_RECT_RADII)
        ctx.stroke()


        ctx.restore()

        this.drawWord(ctx, textColour)
    }

    draw(ctx) {
        let textColour = this.isHovered ? this.colour1 : this.colour2
        let bgColor = this.isHovered ? this.colour2 : this.colour1
        textColour = !this.hidden ? textColour : bgColor

        this.drawOutlinedWord(ctx, textColour, bgColor)
    }
}

export class NumberToMemorize extends OutlinedTextOnCanvas {
    constructor(ctx, text, x, y, {width=null, fontsize=24, font="Arial", disabled=false}={}) {
        super(ctx, text, x, y, {fontsize: fontsize, font: font, width: width, disabled: disabled})
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
    constructor(ctx, text, x, y, {fontsize=24}) {
        super(ctx, text, x, y, 
            {colour1: WORD_COLOUR, disabled: false, fontsize: fontsize})
        this.time_ms = 0
        this.countdown = false
        this.reset()
    }

    reset(resetTime=0) {
        this.time_ms = resetTime
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

    getScore() {
        return Math.round(100000 / (1000 + this.time_ms))
    }
}


export class ScoreDisplay extends TextOnCanvas {
    constructor(ctx, text, x, y, {fontsize=24}) {
        super(ctx, text, x, y, 
            {colour1: WORD_COLOUR, disabled: false, fontsize: fontsize})
    }

    update(score) {
        console.log("HERE")
        this.text = `Score: ${score}`
    }
}
// export class startMenuElement extends OutlinedTextOnCanvas {
//     constructor(ctx, text, x, y, fontsize=24, font="Arial", clickDestination) {
//         super(ctx, text, x, y, fontsize, font)
//         this.clickDestination=clickDestination
//     }

//     clickFunction(){

//     }
// }