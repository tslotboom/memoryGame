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

let lastTime = 0
const clock = new Clock(ctx, null, 100, 0)



const midX = canvas.width / 2
const menuStartY = 160
const wordOffset = 60



function init() {
  visibleObjects.length = 0
}

function initMenu() {
  init()
  let start = new OutlinedTextOnCanvas(ctx, "START", midX, menuStartY)
  start.onClick(() => {
    currentGameState = GameState.PLAYING
    initPlaying()
  })
  let settings = new OutlinedTextOnCanvas(ctx, "SETTINGS", midX, menuStartY + wordOffset) 
  settings.onClick(() => {
    visibleObjects.length = 0
    currentGameState = GameState.SETTINGS
    initSettings()
  })
  visibleObjects.push(start)
  visibleObjects.push(settings)
}


function initSettings() {
  init()
  let test1 = new OutlinedTextOnCanvas(ctx, "BACK", midX, menuStartY + wordOffset * 3)
  visibleObjects.push(test1)

  test1.onClick(() => {
    currentGameState = GameState.MENU
    initMenu()
  })
}


function initPlaying(){
  init()
  visibleObjects.push(clock)
  clock.enabled = true

  for (let i=0; i<10; i++){
    let x = (Math.random() * 0.8 + 0.1) * canvas.width
    let y = (Math.random() * 0.8 + 0.1) * canvas.height
    let num = new Number(ctx, i, x, y)
    visibleObjects.push(num)
    num.onClick(() => {
      const index = visibleObjects.indexOf(num)
      if (index !== -1) {
        visibleObjects.splice(index, 1)
        console.log(visibleObjects)
      }
    })
  }
}


function drawStuff() {
  for (let object of visibleObjects) {
    object.draw(ctx)
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawStuff()
  // if (currentGameState === GameState.MENU) {
  //   drawMenu()
  // }
  // elif ((currentGameState === GameState.SETTINGS) {
  //   drawSettings()
  // }
}

function loop(timestamp) {
  // console.log(timestamp)


  const ms_dt = (timestamp - lastTime)
  lastTime = timestamp
  if (currentGameState == GameState.PLAYING) {
    clock.update(ms_dt)
  }
  draw()

  requestAnimationFrame(loop)
}

initMenu()
// drawMenu()
requestAnimationFrame(loop)

// console.log(interactiveRects)