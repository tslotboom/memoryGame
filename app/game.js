import { initMouse } from './mouse.js'
import { TextOnCanvas, OutlinedTextOnCanvas, NumberToMemorize, Clock, ScoreDisplay } from './objects.js'
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
  PREAMBLE_QUICK: 'preamble',
  QUICK_MODE: 'quick_mode', 
  PREAMBLE_PROGRESSIVE: 'preamble_progressive',
  PROGRESSIVE_MODE: 'progressive_mode',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
}

let currentGameState = GameState.MENU
let initFlag = true
let win=false
let progressiveNumbers = 1
let score = 0


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

const midX = canvas.width / 2
const menuStartY = 160
const wordOffset = 60
const topRow = 20


const smallerFont = 16
const biggerFont = 32

let lastTime = null
const clock = new Clock(ctx, 0, 100, topRow, {fontsize: smallerFont})

function init(clear=true) {
  if (clear){
    visibleObjects.length = 0
  }
  initFlag = false
}

function initMenu() {
  score = 0
  init()
  let quickMode = new OutlinedTextOnCanvas(ctx, "QUICK MODE", midX, menuStartY)
  quickMode.onClick(() => {
    currentGameState = GameState.PREAMBLE_QUICK
    initFlag = true
  })
  visibleObjects.push(quickMode)

  let progressiveMode = new OutlinedTextOnCanvas(ctx, "PROGRESSIVE MODE", midX, menuStartY + wordOffset)
  progressiveMode.onClick(() => {
    currentGameState = GameState.PREAMBLE_PROGRESSIVE
    initFlag = true
  })
  visibleObjects.push(progressiveMode)

  // let progessionMode = new OutlinedTextOnCanvas(ctx, "QUICK MODE", midX, menuStartY)
  // quickMode.onClick(() => {
  //   currentGameState = GameState.PREAMBLE
  //   initFlag = true
  // })
  
  // let settings = new OutlinedTextOnCanvas(ctx, "SETTINGS", midX, menuStartY + wordOffset) 
  // settings.onClick(() => {
  //   visibleObjects.length = 0
  //   currentGameState = GameState.SETTINGS
  //   initFlag = true
  // })
  // visibleObjects.push(settings)
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


function initPreamble(numNumbers, nextGameState){
  init()
  const text = "Memorize the positions of the numbers below. Click anywhere when you've memorized them."
  const preamble = new OutlinedTextOnCanvas(ctx, text, midX, 20, {fontsize: smallerFont, clickAnywhere: true})
  preamble.onClick(() => {
    currentGameState = nextGameState
    initFlag = true
    removeVisibleObject(preamble)
  })
  visibleObjects.push(preamble)
  
  const scoreDisplay = new ScoreDisplay(ctx, `Score: ${score}`, canvas.width - 70, topRow, {fontsize: smallerFont, disabled: true})
  // scoreDisplay.update(() => {

  // })
  visibleObjects.push(scoreDisplay)

  initNumbers(numNumbers)
}

function initNumbers(numNumbers){
  const areRectsOverlapping = (rectA, rectB) => {
    return (
      rectA.rectX < rectB.rectX + rectB.rectWidth &&
      rectA.rectX + rectA.rectWidth > rectB.rectX &&
      rectA.rectY < rectB.rectY + rectB.rectHeight &&
      rectA.rectY + rectA.rectHeight > rectB.rectY
    )
  }

  for (let i=1; i<numNumbers + 1; i++){
    let num = null

    while (!num){
      let positionOk = true
      let xBound = 0.8
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
        score += 100 + clock.getScore()
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
  visibleObjects.push(words)

  const menu  = new OutlinedTextOnCanvas(ctx, "Back to menu", midX, menuStartY + wordOffset * 1.5, {fontsize: smallerFont})
  menu.onClick(() => {
    currentGameState = GameState.MENU
    initFlag = true
  })
  visibleObjects.push(menu)

  win = false
  progressiveNumbers = 1
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
    if (object instanceof NumberToMemorize || object instanceof Clock ){
      object.update(ms_dt)
    }
    if (object instanceof ScoreDisplay){
      object.update(score)
    }
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
    case GameState.PREAMBLE_QUICK:
      if (initFlag){
        initPreamble(quickGameNumNumbers, GameState.QUICK_MODE)
      }
      break
    case GameState.QUICK_MODE:
      if (initFlag){
        initPlaying()
      }
      if (nextValidNum > quickGameNumNumbers){
        initFlag = true
        win = true
        currentGameState = GameState.GAME_OVER
      }
      break
    case GameState.PREAMBLE_PROGRESSIVE:
      if (initFlag){
        initPreamble(progressiveNumbers, GameState.PROGRESSIVE_MODE)
      }
      break
    case GameState.PROGRESSIVE_MODE:
      if (initFlag){
        initPlaying()
      }
      if (nextValidNum > progressiveNumbers){
        progressiveNumbers += 1
        initFlag = true
        currentGameState = GameState.PREAMBLE_PROGRESSIVE
        initPreamble(progressiveNumbers, GameState.PROGRESSIVE_MODE)
      }
      break
    case GameState.GAME_OVER:
      if (initFlag){
        initGameOver()
      }
      break
    case GameState.PAUSED:
      break
  }
}

function loop(timestamp) {
  // console.log(currentGameState)
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
