import { Colour } from 'src/components/Types'

export function ByteToColour(byte: number): Colour {
  switch (byte) {
    case 0:
      return 'white'
    case 1:
      return 'red'
    case 2:
      return 'yellow'
    case 3:
      return 'green'
    case 4:
      return 'cyan'
    case 5:
      return 'blue'
    default:
      return 'white'
  }
}

export function ColourToByte(colour: Colour) {
  switch (colour) {
    case 'white':
      return 0
    case 'red':
      return 1
    case 'yellow':
      return 2
    case 'green':
      return 3
    case 'cyan':
      return 4
    case 'blue':
      return 5
    default:
      return 0
  }
}
