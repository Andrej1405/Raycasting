import { toRadians, distance, outOfMapBounds } from './helpers'
import { COLORS, Player, Ray } from './types'

const map: Array<Array<number>> = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
]

const SCREEN_WIDTH = window.innerWidth
const SCREEN_HEIGHT = window.innerHeight

const TICK = 30
const CELL_SIZE = 32
const FOV = toRadians(60)

const actionButtons = ['ArrowUp', 'w', 'ArrowDown', 's']

const player: Player = {
  x: CELL_SIZE * 1.25,
  y: CELL_SIZE * 1.25,
  angle: toRadians(0),
  speed: 0,
}

const canvas = document.createElement('canvas')
const context = canvas.getContext('2d')!

canvas.setAttribute('width', SCREEN_WIDTH.toString())
canvas.setAttribute('height', SCREEN_HEIGHT.toString())
document.body.appendChild(canvas)

const clearScreen = () => {
  context.fillStyle = 'white'
  context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
}

const renderMinimap = (posX = 0, posY = 0, scale: number, rays: Array<Ray>) => {
  const cellSize = scale * CELL_SIZE

  map.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        context.fillStyle = 'grey'
        context.fillRect(posX + x * cellSize, posY + y * cellSize, cellSize, cellSize)
      }
    })
  })

  context.fillStyle = 'blue'
  context.fillRect(posX + player.x * scale - 10 / 2, posY + player.y * scale - 10 / 2, 10, 10)

  context.strokeStyle = 'blue'
  context.beginPath()
  context.moveTo(player.x * scale, player.y * scale)
  context.lineTo((player.x + Math.cos(player.angle) * 20) * scale, (player.y + Math.sin(player.angle) * 20) * scale)
  context.closePath()
  context.stroke()

  context.strokeStyle = COLORS.RAYS

  rays.forEach((ray: Ray) => {
    context.beginPath()
    context.moveTo(player.x * scale, player.y * scale)
    context.lineTo(
      (player.x + Math.cos(ray.angle) * ray.distance) * scale,
      (player.y + Math.sin(ray.angle) * ray.distance) * scale
    )

    context.closePath()
    context.stroke()
  })
}

function getVCollision(angle: number): Ray {
  const right = Math.abs(Math.floor((angle - Math.PI / 2) / Math.PI) % 2)

  const firstX = right
    ? Math.floor(player.x / CELL_SIZE) * CELL_SIZE + CELL_SIZE
    : Math.floor(player.x / CELL_SIZE) * CELL_SIZE

  const firstY = player.y + (firstX - player.x) * Math.tan(angle)

  const xA = right ? CELL_SIZE : -CELL_SIZE
  const yA = xA * Math.tan(angle)

  let wall
  let nextX = firstX
  let nextY = firstY

  while (!wall) {
    const cellX = right ? Math.floor(nextX / CELL_SIZE) : Math.floor(nextX / CELL_SIZE) - 1
    const cellY = Math.floor(nextY / CELL_SIZE)

    if (outOfMapBounds(cellX, cellY, map)) break

    wall = map[cellY][cellX]

    if (!wall) {
      nextX += xA
      nextY += yA
    } else {
    }
  }

  return {
    angle,
    distance: distance(player.x, player.y, nextX, nextY),
    vertical: true,
  }
}

function getHCollision(angle: number) {
  const up = Math.abs(Math.floor(angle / Math.PI) % 2)
  const firstY = up
    ? Math.floor(player.y / CELL_SIZE) * CELL_SIZE
    : Math.floor(player.y / CELL_SIZE) * CELL_SIZE + CELL_SIZE
  const firstX = player.x + (firstY - player.y) / Math.tan(angle)

  const yA = up ? -CELL_SIZE : CELL_SIZE
  const xA = yA / Math.tan(angle)

  let wall
  let nextX = firstX
  let nextY = firstY

  while (!wall) {
    const cellX = Math.floor(nextX / CELL_SIZE)
    const cellY = up ? Math.floor(nextY / CELL_SIZE) - 1 : Math.floor(nextY / CELL_SIZE)

    if (outOfMapBounds(cellX, cellY, map)) break

    wall = map[cellY][cellX]
    if (!wall) {
      nextX += xA
      nextY += yA
    }
  }

  return {
    angle,
    distance: distance(player.x, player.y, nextX, nextY),
    vertical: false,
  }
}

function castRay(angle: number) {
  const vCollision = getVCollision(angle)
  const hCollision = getHCollision(angle)

  return hCollision.distance >= vCollision.distance ? vCollision : hCollision
}

function fixFishEye(distance: number, angle: number, playerAngle: number) {
  const diff = angle - playerAngle
  return distance * Math.cos(diff)
}

function getRays() {
  const initialAngle = player.angle - FOV / 2
  const numberOfRays = SCREEN_WIDTH
  const angleStep = FOV / numberOfRays

  return Array.from({ length: numberOfRays }, (_, i) => {
    const angle = initialAngle + i * angleStep
    return castRay(angle)
  })
}

function movePlayer() {
  player.x += Math.cos(player.angle) * player.speed
  player.y += Math.sin(player.angle) * player.speed
}

function renderScene(rays: Array<Ray>) {
  rays.forEach((ray, i: number) => {
    const distance = fixFishEye(ray.distance, ray.angle, player.angle)
    const wallHeight = ((CELL_SIZE * 5) / distance) * 150

    context.fillStyle = ray.vertical ? COLORS.WALL_DARK : COLORS.WALL
    context.fillRect(i, SCREEN_HEIGHT / 2 - wallHeight / 2, 1, wallHeight)
    context.fillStyle = COLORS.FLOOR
    context.fillRect(i, SCREEN_HEIGHT / 2 + wallHeight / 2, 1, SCREEN_HEIGHT / 2 - wallHeight / 2)

    context.fillStyle = COLORS.CEILING
    context.fillRect(i, 0, 1, SCREEN_HEIGHT / 2 - wallHeight / 2)
  })
}

function gameLoop() {
  const rays = getRays()
  //canvas.requestPointerLock();

  clearScreen()
  movePlayer()
  renderScene(rays)
  renderMinimap(0, 0, 0.25, rays)
}

setInterval(gameLoop, TICK)

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' || e.key === 'w') player.speed = 1
  if (e.key === 'ArrowDown' || e.key === 's') player.speed = -1
})

document.addEventListener('keyup', e => (actionButtons.includes(e.key) ? (player.speed = 0) : null))
document.addEventListener('mousemove', e => (player.angle += toRadians(e.movementX)))
