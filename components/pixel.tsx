import styles from './pixel.module.css'
import { pixelSize } from './map'

export default function Pixel({ item }) {
  return (
    <div
      className={styles.pixel}
      style={{
        width: pixelSize,
        height: pixelSize,
        top: item.x * pixelSize,
        left: item.y * pixelSize,
        background: item.colour,
      }}
    />
  )
}
