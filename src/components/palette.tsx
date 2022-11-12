import styled from 'styled-components'

import { CustomButton } from 'src/components/CustomButton'
import { Colour } from 'src/components/Types'
import { colours } from 'src/components/layout'

export default function Palette({
  onClose,
  onSelectColour,
  onAccept
}: {
  onClose: () => void
  onSelectColour: (colour: Colour) => void
  onAccept: () => void
}) {
  return (
    <ColourPickerDiv>
      <ColourPalette>
        {colours.map((colour) => {
          return (
            <PaletteItem
              key={colour}
              onClick={() => {
                onSelectColour(colour)
              }}
              style={{ background: colour }}
            />
          )
        })}
      </ColourPalette>
      <CenteredButtons>
        {/*Go back (stop placing) */}
        <CustomButton onClick={() => onClose()}>x</CustomButton>
        {/*Confirm placing of tile with selected colour */}
        <CustomButton onClick={() => onAccept()}>v</CustomButton>
      </CenteredButtons>
    </ColourPickerDiv>
  )
}

const ColourPickerDiv = styled.div`
  display: grid;
  grid-template-row: 1fr 1fr;
`

const ColourPalette = styled.div`
  display: flex;
  flex-direction: row;
`

const PaletteItem = styled.button`
  margin: 5px;
  width: 10vw;
  height: 5vw;
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
`

const CenteredButtons = styled.div`
  display: flex;
  justify-content: center;
`
