import {
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { addPoints, diffPoints, scalePoint } from '../helpers/math'

import { colours, pixelSize } from './layout'

const mapSize = { width: 500, height: 500 }
const ORIGIN = Object.freeze({ x: 0, y: 0 })

const ZOOM_SENSITIVITY = 200 // bigger for lower zoom per scroll

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
  let index = 0
  for (let x = 0; x < mapSize.width; x++) {
    for (let y = 0; y < mapSize.height; y++) {
      const randomIndex = Math.floor(Math.random() * colours.length)
      tiles.push({ x, y, colour: colours[randomIndex] })
      /*tiles.push({ x, y, colour: small[index].colour })
      index = (index + 1) % small.length*/
    }
  }
  return tiles
}

export default function Map() {
  //TODO diff datastructure
  const tiles = generateTiles()

  const canvasRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
  const [scale, setScale] = useState<number>(1)
  const [offset, setOffset] = useState<Point>(ORIGIN)
  const [mousePos, setMousePos] = useState<Point>(ORIGIN)
  const [viewportTopLeft, setViewportTopLeft] = useState<Point>(ORIGIN)

  const isResetRef = useRef<boolean>(false)
  const lastMousePosRef = useRef<Point>(ORIGIN)
  const lastOffsetRef = useRef<Point>(ORIGIN)

  // update last offset
  useEffect(() => {
    lastOffsetRef.current = offset
  }, [offset])

  // reset
  const reset = useCallback(
    (context: CanvasRenderingContext2D) => {
      if (context && !isResetRef.current) {
        setScale(1)

        // reset state and refs
        setContext(context)
        setOffset(ORIGIN)
        setMousePos(ORIGIN)
        setViewportTopLeft(ORIGIN)
        lastOffsetRef.current = ORIGIN
        lastMousePosRef.current = ORIGIN

        // this thing is so multiple resets in a row don't clear canvas
        isResetRef.current = true
      }
    },
    [canvasSize]
  )

  // functions for panning
  const mouseMove = useCallback(
    (event: MouseEvent) => {
      if (context) {
        const lastMousePos = lastMousePosRef.current
        const currentMousePos = { x: event.pageX, y: event.pageY } // use document so can pan off element
        lastMousePosRef.current = currentMousePos

        const mouseDiff = diffPoints(currentMousePos, lastMousePos)
        setOffset((prevOffset) => addPoints(prevOffset, mouseDiff))
      }
    },
    [context]
  )

  const mouseUp = useCallback(() => {
    document.removeEventListener('mousemove', mouseMove)
    document.removeEventListener('mouseup', mouseUp)
  }, [mouseMove])

  const startPan = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      document.addEventListener('mousemove', mouseMove)
      document.addEventListener('mouseup', mouseUp)
      lastMousePosRef.current = { x: event.pageX, y: event.pageY }
    },
    [mouseMove, mouseUp]
  )

  // setup canvas and set context
  useLayoutEffect(() => {
    if (canvasRef.current) {
      // get new drawing context
      const renderCtx = canvasRef.current.getContext('2d')

      if (renderCtx) {
        reset(renderCtx)
      }
    }
  }, [reset, canvasSize])

  // pan when offset or scale changes
  useLayoutEffect(() => {
    if (context && lastOffsetRef.current) {
      const offsetDiff = scalePoint(
        diffPoints(offset, lastOffsetRef.current),
        scale
      )
      //context.translate(offsetDiff.x, offsetDiff.y)
      setViewportTopLeft((prevVal) => diffPoints(prevVal, offsetDiff))
      isResetRef.current = false
    }
  }, [context, offset, scale])

  // add event listener on canvas for mouse position
  useEffect(() => {
    const canvasElem = canvasRef.current
    if (canvasElem === null) {
      return
    }

    function handleUpdateMouse(event: MouseEvent) {
      event.preventDefault()
      if (canvasRef.current) {
        const viewportMousePos = { x: event.clientX, y: event.clientY }
        const topLeftCanvasPos = {
          x: canvasRef.current.offsetLeft,
          y: canvasRef.current.offsetTop,
        }
        setMousePos(diffPoints(viewportMousePos, topLeftCanvasPos))
      }
    }

    canvasElem.addEventListener('mousemove', handleUpdateMouse)
    canvasElem.addEventListener('wheel', handleUpdateMouse)
    return () => {
      canvasElem.removeEventListener('mousemove', handleUpdateMouse)
      canvasElem.removeEventListener('wheel', handleUpdateMouse)
    }
  }, [])

  // add event listener on canvas for zoom
  useEffect(() => {
    const canvasElem = canvasRef.current
    if (canvasElem === null) {
      return
    }

    function handleWheel(event: WheelEvent) {
      event.preventDefault()
      if (context) {
        const zoom = 1 - event.deltaY / ZOOM_SENSITIVITY
        const viewportTopLeftDelta = {
          x: (mousePos.x / scale) * (1 - 1 / zoom),
          y: (mousePos.y / scale) * (1 - 1 / zoom),
        }
        const newViewportTopLeft = addPoints(
          viewportTopLeft,
          viewportTopLeftDelta
        )

        //context.translate(viewportTopLeft.x, viewportTopLeft.y)
        //context.scale(zoom, zoom)
        //context.translate(-newViewportTopLeft.x, -newViewportTopLeft.y)

        setViewportTopLeft(newViewportTopLeft)
        setScale(scale * zoom)
        isResetRef.current = false
      }
    }

    canvasElem.addEventListener('wheel', handleWheel)
    return () => canvasElem.removeEventListener('wheel', handleWheel)
  }, [context, mousePos.x, mousePos.y, viewportTopLeft, scale])

  // draw initial tile canvas
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    /*const { width, height } = canvas.getBoundingClientRect()

    if (canvas.width !== width || canvas.height !== height) {
      const { devicePixelRatio: ratio = 1 } = window
      const context = canvas.getContext('2d')
      canvas.width = width * ratio
      canvas.height = height * ratio
      context.scale(ratio, ratio)
    }*/

    const context = canvas.getContext('2d')
    fullDraw(context)
  }, [canvasSize, context, scale, offset, viewportTopLeft])

  // resize canvas
  useEffect(() => {
    handleResize()

    function handleResize() {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // draw all tiles
  const fullDraw = (ctx, frameCount) => {
    console.log(
      'init draw',
      ctx.canvas.width,
      ctx.canvas.height,
      ctx.canvas.style.left
    )
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    for (const tile of tiles) {
      ctx.fillStyle = tile.colour
      ctx.fillRect(
        tile.x * pixelSize * scale,
        tile.y * pixelSize * scale,
        pixelSize * scale,
        pixelSize * scale
      )
      /*
    for (let x = 0; x < mapSize.width; x++) {
      for (let y = 0; y < mapSize.height; y++) {
        ctx.fillStyle = 'rgba(' + (x * 255) / mapSize.width + ',0,0,0.5)'
        ctx.fillRect(x * scale, y * scale, scale, scale)
      }*/
    }
  }

  return (
    <>
      {canvasSize.width == 0 && (
        <div style={{ position: 'absolute' }}>
          <p>Canvas is loading..</p>
        </div>
      )}
      <canvas
        onMouseDown={startPan}
        ref={canvasRef}
        width={canvasSize.width * pixelSize}
        height={canvasSize.height * pixelSize}
      />
      <div style={{ background: 'black' }}>
        <pre>scale: {scale}</pre>
        <pre>offset: {JSON.stringify(offset)}</pre>
        <pre>viewportTopLeft: {JSON.stringify(viewportTopLeft)}</pre>
      </div>
    </>
  )
}
