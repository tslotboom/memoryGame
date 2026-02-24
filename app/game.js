import { initMouse } from './mouse.js'
import { OutlinedTextOnCanvas, Clock, NumberToMemorize } from './objects.js'
import { initOutsideInput, canvasBackgroundColour, quickGameNumNumbers } from './htmlInputs.js'


const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const visibleObjects = []


const MIN_WIDTH  = 480
const MIN_HEIGHT = 320
const MAX_WIDTH  = 960
const MAX_HEIGHT = 640


initMouse(canvas, visibleObjects)
initOutsideInput()

const GameState = {
  MENU: 'menu',
  PREAMBLE: 'preamble',
  PLAYING: 'playing', 
  PAUSED: 'paused',
  GAME_OVER: 'gameOver'
}

let currentGameState = GameState.MENU
let initFlag = true
let win=false


function resizeCanvas() {
  canvas.width  = Math.min(MAX_WIDTH,  Math.max(MIN_WIDTH,  window.innerWidth))
  canvas.height = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, window.innerHeight))
  drawStuff()
}

// Set initial size
resizeCanvas()

// Listen for window resize
window.addEventListener('resize', resizeCanvas)


let nextValidNum = 1


let lastTime = null
const clock = new Clock(ctx, 0, 100, 0)



const midX = canvas.width / 2
const menuStartY = 160
const wordOffset = 60

const smallerFont = 16
const biggerFont = 32



function init(clear=true) {
  if (clear){
    visibleObjects.length = 0
  }
  initFlag = false
}

function initMenu() {
  init()
  let start = new OutlinedTextOnCanvas(ctx, "START", midX, menuStartY)
  start.onClick(() => {
    currentGameState = GameState.PREAMBLE
    initFlag = true
  })
  let settings = new OutlinedTextOnCanvas(ctx, "SETTINGS", midX, menuStartY + wordOffset) 
  settings.onClick(() => {
    visibleObjects.length = 0
    currentGameState = GameState.SETTINGS
    initFlag = true
  })
  visibleObjects.push(start)
  visibleObjects.push(settings)
}


function initSettings() {
  init()
  let back = new OutlinedTextOnCanvas(ctx, "BACK", midX, menuStartY + wordOffset * 3)
  visibleObjects.push(back)

  back.onClick(() => {
    currentGameState = GameState.MENU
    initFlag = true
  })
}


function initPreamble(){
  init()
  const text = "Memorize the positions of the numbers below. Press this when you've memorized them."
  const preamble = new OutlinedTextOnCanvas(ctx, text, midX, 20, {fontsize: smallerFont})
  preamble.onClick(() => {
    currentGameState = GameState.PLAYING
    initFlag = true
    removeVisibleObject(preamble)
  })
  visibleObjects.push(preamble)

  initNumbers()
}

function initNumbers(){
  const areRectsOverlapping = (rectA, rectB) => {
    return (
      rectA.rectX < rectB.rectX + rectB.rectWidth &&
      rectA.rectX + rectA.rectWidth > rectB.rectX &&
      rectA.rectY < rectB.rectY + rectB.rectHeight &&
      rectA.rectY + rectA.rectHeight > rectB.rectY
    )
  }

  for (let i=1; i<quickGameNumNumbers + 1; i++){
    let num = null

    while (!num){
      let positionOk = true
      let xBound = (canvas.height / canvas.width) * 0.8
      let yBound = 0.8
      let x = (Math.random() * xBound + (1 - xBound) / 2) * canvas.width
      let y = (Math.random() * yBound + (1 - yBound) / 2) * canvas.height
      let candidate = new NumberToMemorize(ctx, String(i), x, y, {width: 2, disabled: true})

      for (let object of visibleObjects){
        if (object instanceof NumberToMemorize && 
            areRectsOverlapping(candidate, object)){
          positionOk = false 
          break 
        }
      }

      if (positionOk){
        num = candidate
      }
    }

    visibleObjects.push(num)
    num.onClick(() => {
      if (num.getValue() == nextValidNum){
        nextValidNum += 1
        num.hidden = false 
        num.disabled = true
        // num.disabled = true
        // num.isHovered = false
        // removeVisibleObject(num)
      }
      else {
        num.setInvalid()
        currentGameState = GameState.GAME_OVER
        initFlag = true
      }
    })
  }
}

function removeVisibleObject(object){
  const index = visibleObjects.indexOf(object)
  if (index !== -1) {
    visibleObjects.splice(index, 1)
  }
  object = null
}

function initPlaying(){
  init(false)
  clock.disabled = false
  nextValidNum = 1
  for (let object of visibleObjects){
    if (object instanceof NumberToMemorize){
      object.disabled = false
      object.hidden = true
    }
  }
  clock.reset()
  visibleObjects.push(clock)
}

function initGameOver(){
  init(false)
  clock.disabled = true
  for (let object of visibleObjects){
    if (object instanceof NumberToMemorize){
      object.disabled = true
      object.hidden = false
    }
  }
  const text = win ? "Good job!!!" : "Oh no!!!"
  const words = new OutlinedTextOnCanvas(ctx, text, midX, menuStartY, {fontsize: biggerFont, disabled: true})
  const menu  = new OutlinedTextOnCanvas(ctx, "Back to menu", midX, menuStartY + wordOffset * 1.5, {fontsize: smallerFont})
  menu.onClick(() => {
    currentGameState = GameState.MENU
    initFlag = true
  })
  visibleObjects.push(words)
  visibleObjects.push(menu)

  win = false
}


function drawStuff() {
  ctx.save()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = canvasBackgroundColour
  // console.log(hexInput)
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.restore()
  for (let object of visibleObjects) {
    object.draw(ctx)
  }
}

function updateGame(ms_dt){
  for (let object of visibleObjects) {
    object.update(ms_dt)
    object.colour2 = canvasBackgroundColour
  }
  switch(currentGameState){
    case GameState.MENU:
      if (initFlag){
        initMenu()
      }
      break
    case GameState.SETTINGS:
      if (initFlag){
        initSettings()
      }
      break
    case GameState.PREAMBLE:
      if (initFlag){
        initPreamble()
      }
      break
    case GameState.PAUSED:
      break
    case GameState.PLAYING:
      if (initFlag){
        initPlaying()
      }
      if (nextValidNum > quickGameNumNumbers){
        initFlag = true
        win = true
        currentGameState = GameState.GAME_OVER
      }
      break
    case GameState.GAME_OVER:
      if (initFlag){
        initGameOver()
      }
      break
  }
}

function loop(timestamp) {
  if (lastTime === null) {
    lastTime = timestamp
    requestAnimationFrame(loop)
    return
  }
  
  const ms_dt = (timestamp - lastTime)
  lastTime = timestamp

  updateGame(ms_dt)
  drawStuff()

  requestAnimationFrame(loop)
}



initMenu()
// drawMenu()
requestAnimationFrame(loop)
