import { CheckCircleFilled } from '@ant-design/icons'
import { Button, Drawer } from 'antd'
import styled from 'styled-components'

import { Colour } from 'src/components/Types'
import { colours } from 'src/components/layout'

export default function Palette({
  onClose,
  colour: currentColour,
  onSelectColour,
  onAccept
}: {
  onClose: () => void
  colour?: Colour
  onSelectColour: (colour: Colour) => void
  onAccept: () => void
}) {
  return (
    <Drawer
      open
      placement='bottom'
      onClose={() => onClose()}
      maskStyle={{ display: 'none' }}
      height='auto'
    >
      <ColourPalette>
        {colours.map((colour) => {
          return (
            <PaletteItem
              key={colour}
              onClick={() => onSelectColour(colour)}
              color={colour}
              style={{
                background: colour,
                border: colour === currentColour ? '2px solid black' : 'none'
              }}
            >
              {/* Somehow nesecarry */}{' '}
            </PaletteItem>
          )
        })}
      </ColourPalette>
      <ButtonCenterer>
        <CenteredButton type='primary' size='large' onClick={() => onAccept()}>
          <CheckCircleFilled />
        </CenteredButton>
      </ButtonCenterer>
    </Drawer>
  )
}

const ColourPalette = styled.div`
  padding: 10px;

  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: 75px;
  gap: 20px;

  justify-content: stretch;
  justify-items: stretch;
`

const PaletteItem = styled(Button)`
  height: 100%;
  width: 100%;
`

const ButtonCenterer = styled.div`
  display: grid;
  place-items: center;
`

const CenteredButton = styled(Button)`
  width: 200px;
`
