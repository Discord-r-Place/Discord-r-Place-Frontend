import useCanvas from '../hooks/useCanvas'

import { colours, pixelSize } from './layout'
import Pixel from './pixel'

export default function Map() {
  //TODO diff datastructure
  const canvasWidth = 1000
  const canvasHeight = 1000
  const tiles = generateTiles()

  /**
   * Generate array of coloured positions (tiles)
   */
  function generateTiles() {
    // Mock tiles
    const small = [
      { x: 0, y: 0, colour: 'red' },
      { x: 0, y: 5, colour: 'yellow' },
      { x: 0, y: 2, colour: 'cyan' },
      { x: 10, y: 0, colour: 'blue' },
      { x: 10, y: 50, colour: 'green' },
      { x: 4, y: 20, colour: 'white' },
    ]
    const tiles = []
    for (let x = 0; x < canvasWidth; x++) {
      for (let y = 0; y < canvasHeight; y++) {
        const randomIndex = Math.floor(Math.random() * colours.length)
        tiles.push({ x, y, colour: colours[randomIndex] })
      }
    }
    return tiles
  }

  function resizeCanvas(canvas) {
    const { width, height } = canvas.getBoundingClientRect()

    if (canvas.width !== width || canvas.height !== height) {
      const { devicePixelRatio: ratio = 1 } = window
      const context = canvas.getContext('2d')
      canvas.width = width * ratio
      canvas.height = height * ratio
      context.scale(ratio, ratio)
      return true
    }

    return false
  }

  const draw = (ctx, frameCount) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    for (const tile of tiles) {
      ctx.fillStyle = tile.colour
      ctx.fillRect(tile.x * pixelSize, tile.y * pixelSize, pixelSize, pixelSize)
    }
    //ctx.arc(50, 100, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI)
  }

  const canvasRef = useCanvas(
    draw,
    (context, canvas) => {
      resizeCanvas
    },
    () => {}
  )

  return (
    <>
      <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />
      {/* Map itself
      <div className={styles.container}>
        tiles.map((item) => {
          return (
            <Pixel
              setPosition={setPosition}
              key={item.x + ',' + item.y}
              item={item}
            />
          )
        })
      </div>
      */}
    </>
  )
}
