import styles from './layout.module.css'
import classNames from 'classnames'
import { useState } from 'react'

import Map from './map'
import Palette from './palette'

export const pixelSize = 1
export const colours = ['white', 'red', 'yellow', 'green', 'cyan', 'blue']

export default function Layout() {
  // Whether we have selected a tile and are placing/painting it
  const [placing, setPlacing] = useState(false)
  const [currentPosition, setPosition] = useState({ x: 0, y: 0 })

  /**
   * Update the colour of the tile at the current position
   */
  /*function updateColour(colour) {
    //TODO diff datastructure
    console.log(currentPosition)
    arr.find(
      (item) => item.x === currentPosition.x && item.y === currentPosition.y
    ).colour = colour
  }*/

  /**
   * Send pixel update to server
   */
  function updatePixel(colour) {
    console.log(
      `TODO: pixel (${currentPosition.x}, ${currentPosition.y}) is now ${colour}, send to server`
    )
  }

  return (
    <div className={styles.container}>
      <Map />
      {/* Upper view with current pixel position*/}
      <div className={classNames(styles.positionView, styles.box)}>
        {currentPosition.x}, {currentPosition.y}
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
            <Palette setPlacing={setPlacing} updatePixel={updatePixel} />
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
      {/* Center tile cursor */}
      <div
        className={styles.cursor}
        style={{
          width: pixelSize,
          height: pixelSize,
          top: currentPosition.y * pixelSize,
          left: currentPosition.x * pixelSize,
          position: 'absolute',
        }}
      >
        cursor
      </div>
    </div>
  )
}
