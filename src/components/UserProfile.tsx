import { Avatar, Button, Popover, Skeleton, Typography } from 'antd'
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import styled, { css } from 'styled-components'

import { GuildSelector } from 'src/components/GuildSelector'

export function UserProfile() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      signIn('discord')
    }
  })

  if (!session)
    return <AvatarSkeletonWrapper active={true} size={64} shape='circle' />

  return (
    <Popover
      content={
        <ContentWrapper>
          <Typography.Text>Signed in as {session.user.name}</Typography.Text>
          <GuildSelector />
          <Button onClick={() => signOut()}>Logout</Button>
        </ContentWrapper>
      }
      placement='bottomRight'
    >
      <AvatarWrapper
        size={64}
        icon={
          <Image src={session.user.image} alt='User Profile Picture' fill />
        }
      />
    </Popover>
  )
}

const AvatarPosition = css`
  position: absolute;
  top: 10px;
  right: 10px;

  z-index: 100;
`

const AvatarWrapper = styled(Avatar)`
  ${AvatarPosition}
`

const AvatarSkeletonWrapper = styled(Skeleton.Avatar)`
  ${AvatarPosition}
`

const ContentWrapper = styled.div`
  display: grid;
  grid-template-row: 1fr 1fr 1fr;
  gap: 10px;
`

const VerticallyAlignedImage = styled(Image)`
  vertical-align: middle;
`

const FallBackServerProfilePictureDiv = styled.div`
  width: 20px;
  height: 20px;
  vertical-align: middle;
  display: inline-block;
  text-align: center;
  font-size: 10px;
  line-height: 20px;
  background-color: #7289da;
`
