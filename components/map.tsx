import { useRef, useEffect, useState } from 'react'
import useCanvas from '../hooks/useCanvas'

import { colours, pixelSize } from './layout'
import Pixel from './pixel'

export default function Map() {
  //TODO diff datastructure
  const tiles = generateTiles()

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    handleResize()

    function handleResize() {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      fullDraw(context)
    }
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    const mapWidth = 1000
    const mapHeight = 1000
    for (let x = 0; x < mapWidth; x++) {
      for (let y = 0; y < mapHeight; y++) {
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

  const fullDraw = (ctx, frameCount) => {
    console.log('init draw', ctx.canvas.width, ctx.canvas.height)
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    for (const tile of tiles) {
      ctx.fillStyle = tile.colour
      ctx.fillRect(tile.x * pixelSize, tile.y * pixelSize, pixelSize, pixelSize)
    }
    //ctx.arc(50, 100, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI)
  }

  /* const canvasRef = useCanvas(
    canvasSize,
    fullDraw,
    (context, canvas) => {
      //resizeCanvas(canvas)
    },
    () => {}
  )*/
  const canvasRef = useRef(null)

  return (
    <>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
      />
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
