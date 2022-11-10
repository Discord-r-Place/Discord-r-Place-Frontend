import styles from './map.module.css'
import classNames from 'classnames'
import { useState } from 'react'

import Palette from './palette'
import Pixel from './pixel'

export const pixelSize = 100

export default function Map() {
  // Mock map pixels
  const tiles = [
    { x: 0, y: 0, colour: 'red' },
    { x: 0, y: 5, colour: 'yellow' },
    { x: 0, y: 2, colour: 'cyan' },
    { x: 10, y: 0, colour: 'blue' },
    { x: 10, y: 50, colour: 'green' },
    { x: 4, y: 20, colour: 'white' },
  ]

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
      {/* Map itself*/}
      <div className={styles.container}>
        {tiles.map((item) => {
          return <Pixel key={item.x + ',' + item.y} item={item} />
        })}
      </div>
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
            <Palette updatePixel={updatePixel} />
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
