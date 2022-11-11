import styles from './palette.module.css'
import classNames from 'classnames'
import { useState } from 'react'

import { colours } from './layout'

export default function Palette({ setPlacing, setCursorColour, updatePixel }) {
  return (
    <>
      <div className={styles.colourPalette}>
        {colours.map((colour) => {
          return (
            <button
              onClick={() => {
                setCursorColour(colour)
              }}
              key={colour}
              className={styles.paletteItem}
              style={{ background: colour }}
            />
          )
        })}
      </div>
      <div>
        {/*Go back (stop placing) */}
        <button onClick={() => setPlacing(false)} className={styles.button}>
          x
        </button>
        {/*Confirm placing of tile with selected colour */}
        <button onClick={updatePixel} className={styles.button}>
          v
        </button>
      </div>
    </>
  )
}
