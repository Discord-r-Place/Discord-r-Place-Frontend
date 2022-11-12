import styles from './map.module.css'
import {
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import { addPoints, diffPoints, scalePoint } from '../helpers/math'

import { colours, pixelSize } from './layout'

const mapSize = { width: 1000, height: 1000 }

type Point = {
  x: number
  y: number
}
const ORIGIN = Object.freeze({ x: 0, y: 0 })

const MAX_SCALE = 50

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
    { x: 4, y: 20, colour: 'white' }
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

export default function Map({ setPosition, cursorColour }) {
  //TODO diff datastructure
  const [tiles, setTiles] = useState(generateTiles)
  //const tilesB =

  const canvasRef = useRef(null)
  const cursorParentRef = useRef(null)
  const contentRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({
    width: mapSize.width,
    height: mapSize.height
  })
  const [minZoom, setMinZoom] = useState(0)

  const [context, setContext] = useState(null)
  const [scale, setScale] = useState<number>(1)
  const [offset, setOffset] = useState<Point>(ORIGIN)
  const [mousePos, setMousePos] = useState<Point>(ORIGIN)
  const [viewportTopLeft, setViewportTopLeft] = useState<Point>(ORIGIN)
  const [parentSize, setParentSize] = useState<Point>(ORIGIN)

  const lastMousePosRef = useRef<Point>(ORIGIN)
  const lastOffsetRef = useRef<Point>(ORIGIN)

  // update last offset
  useEffect(() => {
    lastOffsetRef.current = offset
  }, [offset])

  // update position in layout
  useEffect(() => {
    //console.log(setPosition)

    if (setPosition)
      // TODO could handle formatting in layout component
      setPosition({
        x: Math.floor(viewportTopLeft.x),
        y: Math.floor(viewportTopLeft.y),
        scale:
          scale > 0.02
            ? Math.round(scale * 50) / 10
            : Math.ceil(scale * 500) / 100
      })
  }, [viewportTopLeft, scale])

  function transform(newViewportTopLeft, zoomScale) {
    setScale(zoomScale)
    setViewportTopLeft(newViewportTopLeft)
    const canvas = canvasRef.current
    setCanvasSize({
      width: canvas.width,
      height: canvas.height
    })
    canvas.style.imageRendering =
      zoomScale < 1 / MAX_SCALE / devicePixelRatio ? 'initial' : ''
  }

  // functions for panning
  const mouseMove = useCallback((event: MouseEvent) => {
    const lastMousePos = lastMousePosRef.current
    const currentMousePos = { x: event.pageX, y: event.pageY } // use document so can pan off element
    lastMousePosRef.current = currentMousePos

    const mouseDiff = diffPoints(currentMousePos, lastMousePos)
    //console.log(mouseDiff)
    setOffset((prevOffset) => addPoints(prevOffset, mouseDiff))
  }, [])
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

  // pan when offset or scale changes
  useLayoutEffect(() => {
    if (/*context && */ lastOffsetRef.current) {
      const offsetDiff = scalePoint(
        diffPoints(offset, lastOffsetRef.current),
        scale * MAX_SCALE
      )
      //context.translate(offsetDiff.x, offsetDiff.y)
      const newViewportTopLeft = diffPoints(viewportTopLeft, offsetDiff)
      transform(newViewportTopLeft, scale)
      //isResetRef.current = false
    }
  }, [/*context, */ offset, scale])

  // add event listeners for mouse position
  useEffect(() => {
    function handleUpdateMouse(event: MouseEvent) {
      event.preventDefault()
      if (canvasRef.current) {
        const viewportMousePos = { x: event.clientX, y: event.clientY }
        const topLeftCanvasPos = {
          x: window.innerWidth / 2,
          y: contentRef.current.offsetHeight / 2
        }
        setMousePos(diffPoints(viewportMousePos, topLeftCanvasPos))
        //console.log('mouse update', viewportMousePos, topLeftCanvasPos)
      }
    }
    //console.log('adding mouse listener')
    document.addEventListener('mousemove', handleUpdateMouse)
    document.addEventListener('wheel', handleUpdateMouse)
    return () => {
      document.removeEventListener('mousemove', handleUpdateMouse)
      document.removeEventListener('wheel', handleUpdateMouse)
    }
  }, [])

  // add event listener on canvas for zoom
  useEffect(() => {
    //console.log('adding wheel listener, canvas:', canvasElem)
    function handleWheel(event: WheelEvent) {
      event.preventDefault()
      //console.log('wheel on canvas')
      const zoom = Math.max(
        minZoom / scale,
        Math.min(
          3 ** Math.max(-0.5, Math.min(0.5, event.deltaY * -0.01)),
          1 / scale
        )
      )
      //console.log('zoom:', zoom)
      const zoomScale = scale * zoom
      const viewportTopLeftDelta = {
        x: (mousePos.x * (zoom - 1)) / (zoomScale * MAX_SCALE),
        y: (mousePos.y * (zoom - 1)) / (zoomScale * MAX_SCALE)
      }
      const newViewportTopLeft = addPoints(
        viewportTopLeft,
        viewportTopLeftDelta
      )

      transform(newViewportTopLeft, zoomScale)
      //console.log('scale', zoomScale, 'viewport top left', newViewportTopLeft)
      //console.log('STATE | scale', scale, 'viewport top left', viewportTopLeft)
    }

    document.addEventListener('wheel', handleWheel)
    return () => document.removeEventListener('wheel', handleWheel)
  }, [mousePos.x, mousePos.y, viewportTopLeft, scale])

  // draw initial tile canvas
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    setContext(context)
    fullDraw(context)
  }, [])

  // resize canvas
  useEffect(() => {
    transform(viewportTopLeft, scale)
    handleResize()

    function handleResize() {
      setParentSize({
        width: window.innerWidth / 2,
        height: contentRef.current.offsetHeight / 2
      })

      setMinZoom(
        Math.min(
          window.innerWidth / canvasSize.width,
          //window.innerHeight / mapSize.height
          contentRef.current.offsetHeight / canvasSize.height
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
    /*console.log(
      'full draw',
      ctx.canvas.width,
      ctx.canvas.height,
      ctx.canvas.style.left
    )*/
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    for (const tile of tiles) {
      ctx.fillStyle = tile.colour
      ctx.fillRect(tile.x, tile.y, pixelSize, pixelSize)
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
    <div id='mainContent' ref={contentRef} className={styles.maincontent}>
      {!context && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            zIndex: 5,
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <h1>Canvas is loading..</h1>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={mapSize.width}
        height={mapSize.height}
        style={{
          width: scale * canvasSize.width * MAX_SCALE + 'px',
          height: scale * canvasSize.height * MAX_SCALE + 'px',
          transform:
            'translate(' +
            -viewportTopLeft.x * MAX_SCALE * scale +
            'px, ' +
            -viewportTopLeft.y * MAX_SCALE * scale +
            'px)'
        }}
        className={styles.canvas}
      />
      <div
        style={{ position: 'absolute', background: 'green', color: 'white' }}
      >
        <pre>scale: {scale}</pre>
        <pre>offset: {JSON.stringify(offset)}</pre>
        <pre>viewportTopLeft: {JSON.stringify(viewportTopLeft)}</pre>
      </div>
      {/* Center tile cursor */}
      <div
        onMouseDown={startPan}
        className={styles.cursorparent}
        ref={cursorParentRef}
        style={{
          width: mapSize.width + 'px',
          height: mapSize.height + 'px',
          transform: `translate(${
            viewportTopLeft.x * scale * -MAX_SCALE + parentSize.width
          }px, ${
            viewportTopLeft.y * scale * -MAX_SCALE + parentSize.height
          }px) scale(${scale * MAX_SCALE})`
        }}
      >
        <div
          className={styles.cursor}
          style={{
            background: cursorColour,
            transform:
              'translate(' +
              Math.floor(viewportTopLeft.x) +
              'px, ' +
              Math.floor(viewportTopLeft.y) +
              'px) scale(0.01)'
          }}
        >
          cursor
        </div>
      </div>
    </div>
  )
}
