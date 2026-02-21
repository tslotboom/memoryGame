import { mouse, initMouse } from './mouse.js'
import { TextOnCanvas, OutlinedTextOnCanvas, Clock, Number } from './objects.js'


const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const visibleObjects = []

initMouse(canvas, visibleObjects)

const GameState = {
  MENU: 'menu',
  PREAMBLE: 'preamble',
  PLAYING: 'playing', 
  PAUSED: 'paused',
  GAME_OVER: 'gameOver'
}

let currentGameState = GameState.MENU
let initFlag = true


let wrongAnswers = 0
let nextValidNum = 1
let numNumbers = 3


let lastTime = 0
const clock = new Clock(ctx, "clcok", 100, 0)



const midX = canvas.width / 2
const menuStartY = 160
const wordOffset = 60

const smallerFont = 16

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
  const preamble = new OutlinedTextOnCanvas(ctx, text, midX, 0, {fontsize: smallerFont})
  preamble.onClick(() => {
    currentGameState = GameState.PLAYING
    initFlag = true
    removeVisibleObject(preamble)
  })
  visibleObjects.push(preamble)

  initNumbers()
}

function initNumbers(){
  for (let i=1; i<numNumbers + 1; i++){
    let x = (Math.random() * 0.8 + 0.1) * canvas.width
    let y = (Math.random() * 0.8 + 0.1) * canvas.height
    let num = new Number(ctx, String(i), x, y, {width: 2, disabled: true})
    visibleObjects.push(num)
    num.onClick(() => {
      // console.log(num, num.getValue())
      if (num.getValue() == nextValidNum){
        nextValidNum += 1
        removeVisibleObject(num)
      }
      else {
        num.setInvalid()
        wrongAnswers += 1
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
  // visibleObjects.push(clock)
  // clock.enabled = true
  wrongAnswers = 0
  nextValidNum = 1
  numNumbers = 3
  for (let object of visibleObjects){
    if (object instanceof Number){
      object.disabled = false
      object.hidden = true
    }
  }
}

function initGameOver(time){
  init(false)
  const text = `It took you ${time} to successfully click ${numNumbers} things and you only failed ${wrongAnswers} times! Wow!`
  const words = new TextOnCanvas(ctx, text, midX, menuStartY, {hoverChange: false, fontsize: smallerFont})
  const menu  = new OutlinedTextOnCanvas(ctx, "Back to menu", midX, menuStartY + wordOffset)
  menu.onClick(() => {
    currentGameState = GameState.MENU
    initFlag = true
  })
  visibleObjects.push(words)
  visibleObjects.push(menu)


}


function drawStuff(dt) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (let object of visibleObjects) {
    object.update(dt)
    object.draw(ctx)
  }
}

function updateState(){
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
      if (nextValidNum > numNumbers){
        initFlag = true
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
  // console.log(timestamp)

  updateState()
  const ms_dt = (timestamp - lastTime)
  lastTime = timestamp
  if (currentGameState == GameState.PLAYING) {
    clock.update(ms_dt)
  }
  drawStuff(ms_dt)

  requestAnimationFrame(loop)
}

initMenu()
// drawMenu()
requestAnimationFrame(loop)

// console.log(interactiveRects)