import { useQuery } from '@tanstack/react-query'
import { Avatar, Button, Popover, Select, Skeleton, Typography } from 'antd'
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import styled, { css } from 'styled-components'

import { useGuildContext } from 'src/context/GuildContext'
import { FetchGuilds } from 'src/helpers/FetchGuilds'

export function UserProfile() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      signIn('discord')
    }
  })

  const {
    data: guilds,
    isSuccess,
    isLoading
  } = useQuery(
    ['guilds', session?.user.id],
    () => FetchGuilds(session!.accessToken),
    { enabled: !!session, staleTime: Infinity }
  )

  const guidContext = useGuildContext()

  if (!session)
    return <AvatarSkeletonWrapper active={true} size={64} shape='circle' />

  return (
    <Popover
      content={
        <ContentWrapper>
          <Typography.Text>Signed in as {session.user.name}</Typography.Text>

          {isSuccess && (
            <Select
              loading={isLoading}
              placeholder='Select a guild'
              value={guidContext.guildId ?? null}
              onChange={(guildId) => guidContext.setGuildId(guildId)}
            >
              {guilds.map((guild) => (
                <Select.Option key={guild.id} value={guild.id}>
                  <VerticallyAlignedImage
                    src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                    alt={`${guild.name} icon`}
                    width={20}
                    height={20}
                  />{' '}
                  {guild.name}
                </Select.Option>
              ))}
            </Select>
          )}

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
