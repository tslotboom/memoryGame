import { initMouse } from './mouse.js'
import { OutlinedTextOnCanvas, NumberToMemorize, Clock, ScoreDisplay } from './objects.js'
import { initHTMLSettings, canvasBackgroundColour, quickGameNumNumbers, settingsDiv } from './htmlInputs.js'
import { FONT_SIZE_BIG, MAX_CANVAS_WIDTH, MENU_Y_START, CANVAS_ASPECT_RATIO, SIDE_OFFSET, FONT_SIZE_SMALL, TOP_ROW, 
  WORD_OFFSET, NUM_SQUARE_WIDTH } from './constants.js'
import { monke } from './monke.js'

console.log(monke)

const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const visibleObjects = []


initMouse(canvas, visibleObjects)
initHTMLSettings()

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

// const ogWidth = canvas.width

function resizeCanvas() {
  let oldWidth = canvas.width
  let oldHeight = canvas.height
  
  canvas.width  = Math.min(MAX_CANVAS_WIDTH,  window.innerWidth)
  canvas.height = canvas.width / CANVAS_ASPECT_RATIO

  let widthChangeFactor = canvas.width / oldWidth;
  let heightChangeFactor = canvas.height / oldHeight;

  for (let object of visibleObjects) {
    object.setCoords(ctx, widthChangeFactor, heightChangeFactor)
  }
  // canvas.height = Math.min(MAX_CANVAS_HEIGHT, Math.max(MIN_CANVAS_HEIGHT, window.innerHeight))
  drawStuff()
}

// Set initial size
resizeCanvas()

// Listen for window resize
window.addEventListener('resize', resizeCanvas)


let nextValidNum = 1

const midX = canvas.width / 2
let lastTime = null
const clock = new Clock(ctx, 0, SIDE_OFFSET, TOP_ROW, {fontsize: FONT_SIZE_SMALL})
const score = new ScoreDisplay(ctx, canvas.width - SIDE_OFFSET, TOP_ROW, {fontsize: FONT_SIZE_SMALL, disabled: true})

function init(clear=true) {
  if (clear){
    visibleObjects.length = 0
  }
  initFlag = false
}

function initMenu() {
  init()
  let quickMode = new OutlinedTextOnCanvas(ctx, "QUICK MODE", midX, MENU_Y_START)
  quickMode.onClick(() => {
    currentGameState = GameState.PREAMBLE_QUICK
    initFlag = true
  })
  visibleObjects.push(quickMode)

  let progressiveMode = new OutlinedTextOnCanvas(ctx, "PROGRESSIVE MODE", midX, MENU_Y_START + WORD_OFFSET)
  progressiveMode.onClick(() => {
    currentGameState = GameState.PREAMBLE_PROGRESSIVE
    initFlag = true
  })
  visibleObjects.push(progressiveMode)

  let howToPlay = new OutlinedTextOnCanvas(ctx, "HOW TO PLAY", midX, MENU_Y_START + WORD_OFFSET * 2)
  howToPlay.onClick(() => {
    window.open('https://www.youtube.com/watch?v=ravykEih1rE')
  })
  visibleObjects.push(howToPlay)
  
  score.reset(canvas)

  let settings = new OutlinedTextOnCanvas(ctx, "SETTINGS", midX, MENU_Y_START + WORD_OFFSET * 3) 
  settings.onClick(() => {
    visibleObjects.length = 0
    currentGameState = GameState.SETTINGS
    initFlag = true
  })
  visibleObjects.push(settings)
}

function initPreamble(numNumbers, nextGameState){
  init()
  const text = "Click on the numbers in ascending order."
  const preamble = new OutlinedTextOnCanvas(ctx, text, midX, 20, {fontsize: FONT_SIZE_SMALL, clickAnywhere: true})
  preamble.onClick(() => {
    currentGameState = nextGameState
    initFlag = true
    removeVisibleObject(preamble)
  })
  visibleObjects.push(preamble)
  
  // scoreDisplay.update(() => {

  // })

  initNumbers(numNumbers)

  clock.reset()  
  clock.disabled = false
  visibleObjects.push(clock)

  score.disabled = false
  visibleObjects.push(score)
}

function initNumbers(numNumbers){
  nextValidNum = 1
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
      let candidate = new NumberToMemorize(ctx, String(i), x, y, {width: NUM_SQUARE_WIDTH, isSquare: true})

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
        score.incrementScoreFromClock(clock.time_ms)

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
  for (let object of visibleObjects){
    if (object instanceof NumberToMemorize && !object.disabled){
      object.disabled = false
      object.hidden = true
    }
  }
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
  const words = new OutlinedTextOnCanvas(ctx, text, midX, MENU_Y_START, {fontsize: FONT_SIZE_BIG, disabled: true})
  visibleObjects.push(words)

  // score.centralize(midX)

  const menu  = new OutlinedTextOnCanvas(ctx, "Back to menu", midX, MENU_Y_START + WORD_OFFSET * 2, {fontsize: FONT_SIZE_SMALL})
  menu.onClick(() => {
    currentGameState = GameState.MENU
    initFlag = true
  })
  visibleObjects.push(menu)

  win = false
  progressiveNumbers = 1
}

function initSettings() {
  init()
  settingsDiv.classList.toggle('hidden')
  let back = new OutlinedTextOnCanvas(ctx, "BACK", midX, MENU_Y_START + WORD_OFFSET * 3)
  visibleObjects.push(back)

  back.onClick(() => {
    currentGameState = GameState.MENU
    initFlag = true
    settingsDiv.classList.toggle('hidden')
  })

}

function drawStuff() {
  ctx.save()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = canvasBackgroundColour
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.restore()
  for (let object of visibleObjects) {
    object.draw(ctx)
  }
}

function updateGame(ms_dt){
  for (let object of visibleObjects) {
    // if (object instanceof NumberToMemorize || object instanceof Clock ){
      object.update(ms_dt)
    // }
    object.backgroundColour = canvasBackgroundColour
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
requestAnimationFrame(loop)
