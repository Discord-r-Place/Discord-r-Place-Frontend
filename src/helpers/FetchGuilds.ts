export async function FetchGuilds(accessToken: string) {
  const response = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  })
  const data = await response.json()
  return data as Guild[]
}

type Guild = {
  id: string
  name: string
  icon: string
  owner: boolean
  permissions: number
  features: string[]
  permissions_new: string
}
