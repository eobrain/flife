/* global $canvas */

/* From https://stackoverflow.com/a/17243070/978525
 * accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR
 * h, s, v
*/
function HSVtoRGB (h, s, v) {
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  let r, g, b
  switch (i % 6) {
    case 0:
      r = v
      g = t
      b = p
      break
    case 1:
      r = q
      g = v
      b = p
      break
    case 2:
      r = p
      g = v
      b = t
      break
    case 3:
      r = p
      g = q
      b = v
      break
    case 4:
      r = t
      g = p
      b = v
      break
    case 5:
      r = v
      g = p
      b = q
      break
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

const sleep = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs))

const ctx = $canvas.getContext('2d')

ctx.fillStyle = 'black'
ctx.fillRect(0, 0, 500, 500)

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
  const prev = 0 + !current
  for (let x = 0; x < width; ++x) {
    for (let y = 0; y < width; ++y) {
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
      const dx = x - width / 2
      const dy = y - height / 2
      const r = Math.sqrt(dx * dx + dy * dy)
      cells[current][x][y] = f(neighbors, cells[prev][x][y], r)
    }
  }
}

setValues((neighbors, cell, r) => r > width / 10 ? 0 : (Math.random() > 0.5))

const limit = p => Math.max(0, Math.min(1, p))

const imageData = ctx.getImageData(0, 0, width, height)
const setPixels = () => {
  const data = imageData.data
  const prev = 0 + !current
  for (let i = 0; i < data.length; i += 4) {
    const x = Math.trunc((i / 4) / width)
    const y = (i / 4) % height
    const value = cells[current][x][y]
    const prevValue = cells[prev][x][y]
    const diff = Math.abs(value - prevValue)
    const { r, g, b } = HSVtoRGB(0.5 + 0.5 * limit(diff), 0.7, limit(value ** 0.5))
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
  }
  ctx.putImageData(imageData, 0, 0)
}

setPixels()

const g = p0 => p => Math.exp(-(p - p0) * (p - p0) * 2.88)

const g2 = g(2)
const g3 = g(3)

async function run () {
  for (let t = 0; ; ++t) {
    current = 0 + !current
    await sleep(0)
    // setValues((neighbors, cell) => neighbors === 3 || (neighbors === 2 && cell))
    // setValues((neighbors, cell) => Math.exp(-(((neighbors - 3 + cell / 2) ** 2) / 0.559)))
    setValues((neighbors, cell) =>
      g3(neighbors) + cell * g2(neighbors) * (1.0 / 1.36787944117144)
    )

    setPixels()
  }
}

run()
