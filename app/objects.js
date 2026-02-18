



export class TextOnCanvas {
    constructor(ctx, text, x, y, fontsize=24, font="Arial", noHover=false) {        
        this.x = x 
        this.y = y 
        this.text = text 
        this.fontsize = fontsize
        this.font = `${fontsize}px ${font}`
        this.isHovered = false
        this.noHover = noHover
        this.onClickCallback = null // handle clicks
        this.mouseHeldDownOn = false
        this.padding = 10

        ctx.save()
        // Set font for measurements
        ctx.font = this.font
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        const testMetrics = ctx.measureText(this.text)

        this.rectWidth = testMetrics.width + this.padding * 2
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

    setIsHovered(mouse){
        // is the mouse on top of this thing?
        this.isHovered = !this.noHover && 
                    mouse.x > this.rectX && 
                    mouse.x < this.rectX + this.rectWidth &&
                    mouse.y > this.rectY && 
                    mouse.y < this.rectY + this.rectHeight
    }

    drawWord(ctx) {
        ctx.save()

        ctx.font = this.font
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'

        ctx.fillStyle = this.isHovered ? "black" : "white"

        // console.log("word", this.text, this.isHovered)
        ctx.fillText(this.text, this.x, this.y + this.padding)

        ctx.restore()
        // console.log(this)
    }

    draw(ctx) {
        this.drawWord(ctx)
    }

}

export class OutlinedTextOnCanvas extends TextOnCanvas {
    constructor(ctx, text, x, y, fontsize=24, font="Arial", noHover=false) {
        super(ctx, text, x, y, fontsize, font, noHover)
    }

    drawOutlinedWord(ctx) {
        ctx.save()

        ctx.lineWidth = 3

        // background
        ctx.fillStyle = this.isHovered ? "white" : "black"
        ctx.beginPath()
        ctx.roundRect(this.rectX, this.rectY, this.rectWidth, this.rectHeight, 12)
        ctx.fill()

        // outline
        ctx.strokeStyle = this.isHovered ? "black" : "white"

        ctx.beginPath()
        ctx.roundRect(this.rectX, this.rectY, this.rectWidth, this.rectHeight, 12)
        ctx.stroke()


        ctx.restore()

        this.drawWord(ctx)
    }

    draw(ctx) {
        this.drawOutlinedWord(ctx)
    }
}

export class Clock extends TextOnCanvas {
    constructor(ctx, text, x, y, fontsize=24, font="Arial", noHover=true) {
        super(ctx, text, x, y, fontsize, font, noHover)
        this.enabled = false
        this.time_ms = 0
        this.countdown = false
        // this.reset()
    }

    reset(countdownStart=4000) {
        this.time_ms = countdownStart
    }

    update(dt_ms) {
        // console.log(this.time_ms / 1000)
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

export class Number extends OutlinedTextOnCanvas {
    constructor(ctx, text, x, y, fontsize=24, font="Arial") {
        super(ctx, text, x, y, fontsize, font)
        this.hidden = false
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