import styles from './palette.module.css'
import classNames from 'classnames'
import { useState } from 'react'

import colours from './layout'

export default function Palette({ setPlacing, updateColour, updatePixel }) {
  // Mock palette colours

  const [currentColour, setColour] = useState(colours[0])

  return (
    <>
      <div className={styles.colourPalette}>
        {colours.map((colour) => {
          return (
            <button
              onClick={() => {
                setColour(colour)
                //updateColour(colour)
              }}
              key={colour}
              className={styles.paletteItem}
              style={{ background: colour }}
            />
          )
        })}
      </div>
      current colour: {currentColour}
      <div>
        {/*Go back (stop placing) */}
        <button onClick={() => setPlacing(false)} className={styles.button}>
          x
        </button>
        {/*Confirm placing of tile with selected colour */}
        <button onClick={updatePixel(currentColour)} className={styles.button}>
          v
        </button>
      </div>
    </>
  )
}