import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import styled from 'styled-components'

import { Colour, Point, Position, Size, Tile } from 'src/components/Types'
import { pixelSize } from 'src/components/layout'
import { useApiContext } from 'src/context/ApiContext'
import { useGuildContext } from 'src/context/GuildContext'
import { generateTiles } from 'src/helpers/GenerateTiles'
import { addPoints, diffPoints, scalePoint } from 'src/helpers/math'

const mapSize: Size = { width: 1000, height: 1000 }

const ORIGIN = Object.freeze({ x: 0, y: 0 })
const ORIGIN_SIZE = Object.freeze({ width: 0, height: 0 }) // highly dubious
const MAX_SCALE = 50

export default function Map({
  setPosition,
  cursorColour
}: {
  setPosition: (position: Position) => void
  cursorColour?: Colour | `url('/cursor.svg')`
}) {
  const image = useApiContext()

  console.log(image)

  //TODO diff datastructure
  const [tiles, setTiles] = useState(() => generateTiles(mapSize))
  //const tilesB =

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [renderContext, setRenderContext] = useState<CanvasRenderingContext2D>()

  const cursorParentRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({
    width: mapSize.width,
    height: mapSize.height
  })
  const [minZoom, setMinZoom] = useState(0)

  const [scale, setScale] = useState<number>(1)
  const [offset, setOffset] = useState<Point>(ORIGIN)
  const [mousePos, setMousePos] = useState<Point>(ORIGIN)
  const [viewportTopLeft, setViewportTopLeft] = useState<Point>(ORIGIN)
  const [parentSize, setParentSize] = useState<Size>(ORIGIN_SIZE)

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
  }, [viewportTopLeft, scale, setPosition])

  function transform(
    getNewViewPortTopLeft: (oldViewPortTopLeft: Point) => Point,
    zoomScale: number
  ) {
    setScale(zoomScale)
    setViewportTopLeft((oldViewPortTopLeft) =>
      getNewViewPortTopLeft(oldViewPortTopLeft)
    )
    const canvas = canvasRef.current!
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
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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
      transform(
        (viewportTopLeft) => diffPoints(viewportTopLeft, offsetDiff),
        scale
      )

      //isResetRef.current = false
    }
  }, [offset, scale])

  // add event listeners for mouse position
  useEffect(() => {
    function handleUpdateMouse(event: MouseEvent) {
      event.preventDefault()
      if (canvasRef.current) {
        const viewportMousePos = { x: event.clientX, y: event.clientY }
        const topLeftCanvasPos = {
          x: window.innerWidth / 2,
          y: contentRef.current!.offsetHeight / 2
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

      transform(
        (viewportTopLeft) => addPoints(viewportTopLeft, viewportTopLeftDelta),
        zoomScale
      )
      //console.log('scale', zoomScale, 'viewport top left', newViewportTopLeft)
      //console.log('STATE | scale', scale, 'viewport top left', viewportTopLeft)
    }

    document.addEventListener('wheel', handleWheel)
    return () => document.removeEventListener('wheel', handleWheel)
  }, [mousePos.x, mousePos.y, viewportTopLeft, scale, minZoom])

  // draw initial tile canvas
  useLayoutEffect(() => {
    const canvas = canvasRef.current!
    const context = canvas.getContext('2d')!
    setRenderContext(context)
    DrawTiles(context, tiles)
  }, [tiles])

  // resize canvas
  useEffect(() => {
    transform((viewportTopLeft) => viewportTopLeft, scale)
    handleResize()

    function handleResize() {
      setParentSize({
        width: window.innerWidth / 2,
        height: contentRef.current!.offsetHeight / 2
      })

      setMinZoom(
        Math.min(
          window.innerWidth / canvasSize.width,
          //window.innerHeight / mapSize.height
          contentRef.current!.offsetHeight / canvasSize.height
        ) / 100
      )
    }
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [canvasSize.height, canvasSize.width, scale])

  useEffect(() => {
    // clamp scale
    if (scale < minZoom) setScale(minZoom)
    if (scale > 1) setScale(1)
  }, [minZoom, scale])

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
  const guidContext = useGuildContext()

  return (
    <MainContent id='mainContent' ref={contentRef}>
      {!renderContext && (
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
      <Canvas
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
      />
      <PixelDebugBox>
        <pre>scale: {scale}</pre>
        <pre>offset: {JSON.stringify(offset)}</pre>
        <pre>viewportTopLeft: {JSON.stringify(viewportTopLeft)}</pre>
        <pre>guild: {guidContext.guildId ?? 'none'}</pre>
      </PixelDebugBox>
      {/* Center tile cursor */}
      <CursorParent
        onMouseDown={startPan}
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
        <Cursor
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
        </Cursor>
      </CursorParent>
    </MainContent>
  )
}

/**
 * draw all tiles
 * @param ctx canvas context
 * @param tiles array of tiles
 */
function DrawTiles(ctx: CanvasRenderingContext2D, tiles: Tile[]) {
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

const Canvas = styled.canvas`
  image-rendering: optimizeSpeed;
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: pixelated;
  image-rendering: -o-crisp-edges;
  image-rendering: optimize-contrast;
  -ms-interpolation-mode: nearest-neighbor;
  z-index: 0;
  position: absolute;
  background: #fff;
  outline: 1px white solid;
  z-index: 2;
  top: 50%;
  left: 50%;
`

const Cursor = styled.div`
  width: 100px;
  height: 100px;
  transform-origin: top left;
  position: absolute;
  will-change: transform;
  z-index: 3;
`

const CursorParent = styled.div`
  position: absolute;
  font-size: 0;
  z-index: 3;
  width: 0;
  height: 0;
  flex-shrink: 0;
  transform-origin: top left;
  box-shadow: 0 0 0 0.07px #c6c4c4, 0 0 0 0.24px white, 0 0 0 0.35px #484848;
`

const MainContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  right: 0;
  overflow: hidden;
  z-index: 1;
`

const PixelDebugBox = styled.div`
  position: absolute;
  background: green;
  color: white;
`
