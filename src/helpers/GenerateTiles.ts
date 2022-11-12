import { Size } from 'src/components/Types'
import { colours } from 'src/components/layout'

/**
 * Generate array of coloured positions (tiles)
 */
export function generateTiles(mapSize: Size) {
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
