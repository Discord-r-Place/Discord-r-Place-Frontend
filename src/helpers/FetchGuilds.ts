export async function FetchGuilds(accessToken: string) {
  const response = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  })

  if (response.status !== 200) throw new Error('Failed to fetch guilds.')

  const data = await response.json()
  return data as Guild[]
}

export type Guild = {
  id: string
  name: string
  icon: string
  owner: boolean
  permissions: number
  features: string[]
  permissions_new: string
}
