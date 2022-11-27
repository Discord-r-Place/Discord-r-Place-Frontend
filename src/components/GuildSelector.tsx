import { useQuery } from '@tanstack/react-query'
import { Avatar, Select, Skeleton, Typography } from 'antd'
import { signIn, useSession } from 'next-auth/react'
import Image from 'next/image'
import styled, { css } from 'styled-components'

import { useGuildContext } from 'src/context/GuildContext'
import { FetchGuilds, Guild } from 'src/helpers/FetchGuilds'

export function GuildSelector() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      signIn('discord')
    }
  })

  const guidContext = useGuildContext()

  const {
    data: guilds,
    isSuccess,
    isLoading,
    isError
  } = useQuery(
    ['guilds', session?.user.id],
    () => FetchGuilds(session!.accessToken),
    { enabled: !!session, staleTime: Infinity }
  )

  if (isError) return <Typography.Text>Failed to load guilds</Typography.Text>

  return (
    <Select
      loading={isLoading}
      placeholder='Select a guild'
      value={guidContext.guildId ?? null}
      onChange={(guildId) => guidContext.setGuildId(guildId)}
    >
      {(isSuccess ? guilds : []).map((guild) => (
        <Select.Option key={guild.id} value={guild.id}>
          <GuildProfilePicture guild={guild} /> {guild.name}
        </Select.Option>
      ))}
    </Select>
  )
}

function GuildProfilePicture({ guild }: { guild: Guild }) {
  if (guild.icon) {
    return (
      <VerticallyAlignedImage
        src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
        alt={`${guild.name} icon`}
        width={20}
        height={20}
      />
    )
  }

  let firstCharacters = guild.name
    .split(' ')
    .map((word: string) => word[0])
    .join('')
    .substring(0, 3)
  return (
    <FallBackServerProfilePictureDiv>
      {firstCharacters}
    </FallBackServerProfilePictureDiv>
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
