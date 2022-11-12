import { colours } from 'src/components/layout'
import styles from 'src/components/palette.module.css'

export default function Palette({
  setPlacing,
  setCursorColour,
  updatePixel
}: {
  setPlacing: (placing: boolean) => void
  setCursorColour: (cursorColour: string) => void
  updatePixel: () => void
}) {
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
