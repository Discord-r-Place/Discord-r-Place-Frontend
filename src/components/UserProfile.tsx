import { Avatar, Button, Dropdown, Popover, Typography } from 'antd'
import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'
import styled from 'styled-components'

export function UserProfile() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      signIn('discord')
    }
  })

  return (
    <Popover
      content={
        <ContentWrapper>
          <Typography.Text>Signed in as {session?.user.name}</Typography.Text>
          <Button onClick={() => signOut()}>Logout</Button>
        </ContentWrapper>
      }
      placement='bottomRight'
    >
      <AvatarWrapper
        size={64}
        icon={
          <Image src={session?.user?.image!} alt='User Profile Picture' fill />
        }
      />
    </Popover>
  )
}

const AvatarWrapper = styled(Avatar)`
  position: absolute;
  top: 10px;
  right: 10px;

  z-index: 100;
`

const ContentWrapper = styled.div`
  display: grid;
  grid-template-row: 1fr 1fr;
  gap: 10px;
`
