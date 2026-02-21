const ROUND_RECT_RADII = 12



export class TextOnCanvas {
    constructor(ctx, text, x, y, {width=null, fontsize=24, font="Arial", hoverChange=true, colour="white"}={}) {        
        this.x = x 
        this.y = y 
        this.text = text 
        this.fontsize = fontsize
        this.font = `${fontsize}px ${font}`
        this.isHovered = false
        this.hoverChange = hoverChange
        this.onClickCallback = null // handle clicks
        this.mouseHeldDownOn = false
        this.padding = 10
        this.colour1 = colour

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
        if (this.onClickCallback) {
        this.onClickCallback()
        }
    }

    setInvalid(duration=this.maxInvalidDuration){
        this.currentInvalidDuration=duration
    }

    setIsHovered(mouse){
        // is the mouse on top of this thing?
        this.isHovered = this.hoverChange && 
                    mouse.x > this.rectX && 
                    mouse.x < this.rectX + this.rectWidth &&
                    mouse.y > this.rectY && 
                    mouse.y < this.rectY + this.rectHeight
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
    constructor(ctx, text, x, y, {width=null, fontsize=24, font="Arial", hoverChange=true, colour1="white", colour2="black", disabled=false}={}) {
        super(ctx, text, x, y, 
            {fontsize: fontsize, font: font, hoverChange: hoverChange, colour1: colour1, width: width})
        this.colour2 = colour2
        this.hidden = false
        this.disabled = disabled
    }

    drawOutlinedWord(ctx, colour1, colour2) {
        ctx.save()

        ctx.lineWidth = 3

        // background
        ctx.fillStyle = colour2 
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
        let outlineAndTextColour = !this.hidden ? colour1 : colour2
        ctx.strokeStyle = outlineAndTextColour

        ctx.beginPath()
        ctx.roundRect(this.rectX, this.rectY, this.rectWidth, this.rectHeight, ROUND_RECT_RADII)
        ctx.stroke()


        ctx.restore()

        this.drawWord(ctx, outlineAndTextColour)
    }

    draw(ctx) {
        const colour1 = this.isHovered ? this.colour1 : this.colour2
        const colour2 = this.isHovered ? this.colour2 : this.colour1

        this.drawOutlinedWord(ctx, colour1, colour2)
    }
}

export class Number extends OutlinedTextOnCanvas {
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
    constructor(ctx, text, x, y, fontsize=24, font="Arial", hoverChange=false) {
        super(ctx, text, x, y, fontsize, font, hoverChange)
        this.enabled = false
        this.time_ms = 0
        this.countdown = false
        // this.reset()
    }

    reset(countdownStart=4000) {
        this.time_ms = countdownStart
    }

    update(dt_ms) {
        if (!this.enabled){
            return
        }
        if (this.countdown) {
            this.time_ms -= dt_ms
        }
        if (this.time_ms <= 1 && this.countdown) {
            this.countdown = false
            this.time_ms = 0
        }
        if (!this.countdown) {
            this.time_ms += dt_ms
        }
        this.text = this.clockFromMs(this.time_ms)
    }

    clockFromMs(ms) {
      const hours   = Math.floor(ms / 3600000)
      const minutes = Math.floor((ms % 3600000) / 60000)
      const seconds = Math.floor((ms % 60000) / 1000)
      const millis  = Math.floor(ms % 1000)
    
      // Pad with leading zeros
      const HH = String(hours).padStart(2, '0')
      const MM = String(minutes).padStart(2, '0')
      const SS = String(seconds).padStart(2, '0')
      const MS = String(millis).padStart(2, '0')  // 3 digits for ms
    
      return `${HH}:${MM}:${SS}:${MS}`
    }

    draw(ctx) {
        this.drawWord(ctx)
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