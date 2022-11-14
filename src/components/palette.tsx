import styled from 'styled-components'

import { CustomButton } from 'src/components/CustomButton'
import { ColourPalette } from 'src/components/Types'
import { toCSS } from 'src/helpers/Colours'

export default function Palette({
  onClose,
  onSelectColourIndex,
  onAccept,
  palette
}: {
  onClose: () => void
  onSelectColourIndex: (colourIndex: number) => void
  onAccept: () => void,
  palette: ColourPalette
}) {
  return (
    <ColourPickerDiv>
      <ColourPalette>
        {palette.map((colour, index) => {
          return (
            <PaletteItem
              key={index}
              onClick={() => {
                onSelectColourIndex(index)
              }}
              style={{ background: toCSS(colour) }}
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
