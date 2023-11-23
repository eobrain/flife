/* global $canvas */

const sleep = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs))

const ctx = $canvas.getContext('2d')

ctx.fillStyle = 'black'
ctx.fillRect(0, 0, 300, 300)

const { width, height } = $canvas

const cells = [[], []]
for (let x = 0; x < width; ++x) {
  cells[0][x] = []
  cells[1][x] = []
  for (let y = 0; y < width; ++y) {
    cells[0][x][y] = -1
    cells[1][x][y] = -1
  }
}

let current = 0
function setValues (f) {
  for (let x = 0; x < width; ++x) {
    for (let y = 0; y < width; ++y) {
      const prev = 0 + !current
      const xm1 = (x + width - 1) % width
      const ym1 = (y + width - 1) % width
      const xp1 = (x + 1) % width
      const yp1 = (y + 1) % width
      const neighbors =
        cells[prev][xm1][ym1] +
        cells[prev][xm1][y] +
        cells[prev][xm1][yp1] +
        cells[prev][x][ym1] +
        cells[prev][x][yp1] +
        cells[prev][xp1][ym1] +
        cells[prev][xp1][y] +
        cells[prev][xp1][yp1]
      cells[current][x][y] = f(neighbors, cells[prev][x][y])
    }
  }
}

setValues(() => Math.random() > 0.3)

const setPixels = () => {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const x = Math.trunc((i / 4) / width)
    const y = (i / 4) % height
    const value = cells[current][x][y]
    data[i] = 255 * value // red
    data[i + 1] = 255 * value // green
    data[i + 2] = 255 * value // blue
  }
  ctx.putImageData(imageData, 0, 0)
}

setPixels()

async function run () {
  for (let t = 0; t < 1000000; ++t) {
    current = 0 + !current
    await sleep(0)
    setValues((neighbors, cell) => neighbors === 3 || (neighbors === 2 && cell))
    setPixels()
  }
}

run()
