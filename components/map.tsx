import styles from './map.module.css'
import {
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { addPoints, diffPoints, scalePoint } from '../helpers/math'

import { colours, pixelSize } from './layout'

const mapSize = { width: 300, height: 300 }
const ORIGIN = Object.freeze({ x: 0, y: 0 })

// TODO this is pixelsize
const MAX_SCALE = 50

//TODO diff datastructure
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
  //const tilesB =

  const canvasRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [minZoom, setMinZoom] = useState(0)

  //const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
  const [scale, setScale] = useState<number>(1)
  const [offset, setOffset] = useState<Point>(ORIGIN)
  const [mousePos, setMousePos] = useState<Point>(ORIGIN)
  const [viewportTopLeft, setViewportTopLeft] = useState<Point>(ORIGIN)

  //const isResetRef = useRef<boolean>(false)
  const lastMousePosRef = useRef<Point>(ORIGIN)
  const lastOffsetRef = useRef<Point>(ORIGIN)

  // update last offset
  useEffect(() => {
    lastOffsetRef.current = offset
  }, [offset])

  // reset
  /*const reset = useCallback(
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
  )*/

  // functions for panning
  const mouseMove = useCallback(
    (event: MouseEvent) => {
      //if (context) {
      const lastMousePos = lastMousePosRef.current
      const currentMousePos = { x: event.pageX, y: event.pageY } // use document so can pan off element
      lastMousePosRef.current = currentMousePos

      const mouseDiff = diffPoints(currentMousePos, lastMousePos)
      console.log(mouseDIff)
      setOffset((prevOffset) => addPoints(prevOffset, mouseDiff))
      //}
    },
    [] //[context]
  )
  const mouseUp = useCallback(() => {
    document.removeEventListener('mousemove', mouseMove)
    document.removeEventListener('mouseup', mouseUp)
  }, [mouseMove])

  /*
  const startPan = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      document.addEventListener('mousemove', mouseMove)
      document.addEventListener('mouseup', mouseUp)
      lastMousePosRef.current = { x: event.pageX, y: event.pageY }
    },
    [mouseMove, mouseUp]
  )*/

  // setup canvas and set context
  /*useLayoutEffect(() => {
    if (canvasRef.current) {
      // get new drawing context
      const renderCtx = canvasRef.current.getContext('2d')

      if (renderCtx) {
        reset(renderCtx)
      }
    }
  }, [reset, canvasSize])*/

  // pan when offset or scale changes
  /*useLayoutEffect(() => {
    if (context && lastOffsetRef.current) {
      const offsetDiff = scalePoint(
        diffPoints(offset, lastOffsetRef.current),
        scale
      )
      //context.translate(offsetDiff.x, offsetDiff.y)
      setViewportTopLeft((prevVal) => diffPoints(prevVal, offsetDiff))
      isResetRef.current = false
    }
  }, [context, offset, scale])*/

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
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          //x: canvasRef.current.offsetLeft,
          //y: canvasRef.current.offsetTop,
        }
        setMousePos(diffPoints(viewportMousePos, topLeftCanvasPos))
        console.log('mouse update', viewportMousePos, topLeftCanvasPos)
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
    //console.log('adding wheel listener, canvas:', canvasElem)
    function handleWheel(event: WheelEvent) {
      event.preventDefault()
      //console.log('wheel on canvas')
      //if (context) {
      //const zoom = 1 - event.deltaY / MAX_SCALE
      const zoom = Math.max(
        minZoom / scale,
        Math.min(
          3 ** Math.max(-0.5, Math.min(0.5, event.deltaY * -0.01)),
          1 / scale
        )
      )
      /*const zoom = Math.min(
        3 ** Math.max(-0.5, Math.min(0.5, event.deltaY * -0.01)),
        1 / scale
      )*/
      console.log('zoom:', zoom)
      const zoomScale = scale * zoom
      const viewportTopLeftDelta = {
        //x: (mousePos.x / scale) * (1 - 1 / zoom),
        //y: (mousePos.y / scale) * (1 - 1 / zoom),
        x: (mousePos.x * (zoom - 1)) / (zoomScale * MAX_SCALE),
        y: (mousePos.y * (zoom - 1)) / (zoomScale * MAX_SCALE),
      }
      const newViewportTopLeft = addPoints(
        viewportTopLeft,
        viewportTopLeftDelta
      )

      //context.translate(viewportTopLeft.x, viewportTopLeft.y)
      //context.scale(zoom, zoom)
      //context.translate(-newViewportTopLeft.x, -newViewportTopLeft.y)
      transform()
      function transform() {
        /*canvparent1.style.transform = canvparent2.style.transform =
            'translate(' +
            (x * z * -50 + innerWidth / 2) +
            'px, ' +
            (y * z * -50 + maincontent.offsetHeight / 2) +
            'px) scale(' +
            z * 50 +
            ')'
          canvselect.style.transform =
            'translate(' +
            Math.floor(x) +
            'px, ' +
            Math.floor(y) +
            'px) scale(0.01)'*/

        const canvas = canvasRef.current
        canvas.style.width = zoomScale * canvas.width * MAX_SCALE + 'px'
        canvas.style.height = zoomScale * canvas.height * MAX_SCALE + 'px'
        canvas.style.transform =
          'translate(' +
          -newViewportTopLeft.x * MAX_SCALE * zoomScale +
          'px, ' +
          -newViewportTopLeft.y * MAX_SCALE * zoomScale +
          'px)'
        canvas.style.imageRendering =
          zoomScale < 1 / MAX_SCALE / devicePixelRatio ? 'initial' : ''

        /*setCursorTransform(
          'translate(' +
            Math.floor(viewportTopLeft.x) +
            'px, ' +
            Math.floor(viewportTopLeft.y) +
            'px) scale(0.01)'
        )*/
      }
      setScale(zoomScale)
      setViewportTopLeft(newViewportTopLeft)
      console.log('scale', zoomScale, 'viewport top left', newViewportTopLeft)
      console.log('STATE | scale', scale, 'viewport top left', viewportTopLeft)
      //isResetRef.current = false
      //}
    }

    canvasElem.addEventListener('wheel', handleWheel)
    return () => canvasElem.removeEventListener('wheel', handleWheel)
  }, [/*context,*/ mousePos.x, mousePos.y, viewportTopLeft, scale])

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
  }, [canvasSize, /*context,*/ scale, offset, viewportTopLeft])

  // resize canvas
  useEffect(() => {
    handleResize()

    function handleResize() {
      /*setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })*/

      setMinZoom(
        Math.min(
          window.innerWidth / mapSize.width,
          window.innerHeight / mapSize.height
          //maincontent.offsetHeight / mapSize.height
        ) / 100
      )
    }
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // clamp scale
    if (scale < minZoom) setScale(minZoom)
    if (scale > 1) setScale(1)
  }, [scale])

  // draw all tiles
  const fullDraw = (ctx, frameCount) => {
    console.log(
      'full draw',
      ctx.canvas.width,
      ctx.canvas.height,
      ctx.canvas.style.left
    )
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    for (const tile of tiles) {
      ctx.fillStyle = tile.colour
      /*ctx.fillRect(
        tile.x * pixelSize,
        tile.y * pixelSize * scale,
        pixelSize * scale,
        pixelSize * scale
      )*/
      ctx.fillRect(tile.x, tile.y, pixelSize, pixelSize)
      /*
    for (let x = 0; x < mapSize.width; x++) {
      for (let y = 0; y < mapSize.height; y++) {
        ctx.fillStyle = 'rgba(' + (x * 255) / mapSize.width + ',0,0,0.5)'
        ctx.fillRect(x * scale, y * scale, scale, scale)
      }*/
    }
  }

  /*function set(ctx, x, y, b) {
    board[(x % canvas.width) + (y % canvas.height) * canvas.width] = b
    //xa[0] = PALETTE[b]
    ctx.fillStyle =
      '#' +
      (xb[0] < 16 ? '0' : '') +
      xb[0].toString(16) +
      (xb[1] < 16 ? '0' : '') +
      xb[1].toString(16) +
      (xb[2] < 16 ? '0' : '') +
      xb[2].toString(16) +
      (xb[3] < 16 ? '0' : '') +
      xb[3].toString(16)
    ctx.clearRect(x, y, 1, 1)
    ctx.fillRect(x, y, 1, 1)
  }*/

  return (
    <>
      {canvasSize.width == 0 && (
        <div style={{ position: 'absolute' }}>
          <p>Canvas is loading..</p>
        </div>
      )}
      <canvas
        //onMouseDown={startPan}
        ref={canvasRef}
        //width={canvasSize.width * pixelSize}
        //height={canvasSize.height * pixelSize}
        width={mapSize.width}
        height={mapSize.height}
        className={styles.canvas}
      />
      <div
        style={{ position: 'absolute', background: 'green', color: 'white' }}
      >
        <pre>scale: {scale}</pre>
        <pre>offset: {JSON.stringify(offset)}</pre>
        <pre>viewportTopLeft: {JSON.stringify(viewportTopLeft)}</pre>
      </div>
    </>
  )
}
