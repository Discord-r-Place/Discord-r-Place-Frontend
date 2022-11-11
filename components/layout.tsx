import styles from './layout.module.css'
import classNames from 'classnames'
import { useState } from 'react'

import Map from './map'
import Palette from './palette'

export const pixelSize = 1
// Mock palette colours
export const colours = ['white', 'red', 'yellow', 'green', 'cyan', 'blue']

export default function Layout() {
  // Whether we have selected a tile and are placing/painting it
  const [placing, setPlacing] = useState(false)
  const [currentPosition, setPosition] = useState({ x: 0, y: 0, scale: 1 })
  // The colour of the tile we are placing
  const [cursorColour, setColour] = useState('')

  /**
   * Send pixel update to server
   */
  function updatePixel(colour) {
    console.log(
      `TODO: pixel (${currentPosition.x}, ${currentPosition.y}) is now ${colour}, send to server`
    )
  }

  return (
    <>
      <Map
        setPosition={setPosition}
        cursorColour={placing ? cursorColour : ''}
      />
      <div className={styles.container}>
        {/* Upper view with current pixel position*/}
        <div className={classNames(styles.positionView, styles.box)}>
          {currentPosition.x.toFixed()}, {currentPosition.y.toFixed()},{' '}
          {currentPosition.scale.toFixed()}
          {/*`(${Math.floor(x)},${Math.floor(y)}) $
          {z > 0.02 ? Math.round(z * 50) / 10 : Math.ceil(z * 500) / 100}x`*/}
        </div>
        {
          // Lower 'footer' view
          // Palette if we have selected a tile and are placing, button otherwise
          placing ? (
            <div
              className={classNames(styles.footer, styles.box)}
              style={{
                width: '100vw',
              }}
            >
              current palette colour: {cursorColour}
              <Palette
                setPlacing={setPlacing}
                setCursorColour={setColour}
                updatePixel={updatePixel}
              />
            </div>
          ) : (
            <button
              onClick={() => setPlacing(true)}
              className={classNames(styles.footer, styles.box)}
            >
              paint tile
            </button>
          )
        }
      </div>
    </>
  )
}
