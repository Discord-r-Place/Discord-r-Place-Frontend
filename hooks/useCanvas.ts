import { useRef, useEffect } from 'react'

const useCanvas = (update, draw, predraw, postdraw, options = {}) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext(options.context || '2d')
    let frameCount = 0
    let animationFrameId
    const render = () => {
      frameCount++
      predraw(context, canvas)
      draw(context, frameCount)
      postdraw(context, canvas)
      animationFrameId = window.requestAnimationFrame(render)
    }
    render()
    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [])
  return canvasRef
}
export default useCanvas
