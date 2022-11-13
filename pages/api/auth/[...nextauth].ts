import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import getConfig from 'next/config'

const scope = 'identify guilds'

/**
 * Map nextauth using a normal api to use runtime variables.
 * @param req The request object
 * @param res The response object
 * @returns A response.
 */
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const {
    serverRuntimeConfig: {
      DISCORD_CLIENT_SECRET,
      DISCORD_CLIENT_ID,
      SESSION_SECRET
    }
  } = getConfig()

  return await NextAuth(req, res, {
    providers: [
      DiscordProvider({
        clientId: DISCORD_CLIENT_ID,
        clientSecret: DISCORD_CLIENT_SECRET,
        authorization: {
          params: { scope }
        }
      })
    ],
    callbacks: {
      async jwt({ token, account, user }) {
        // First login, take account and user information and add it to the token.
        if (account && user) {
          return {
            accessToken: account.access_token,
            accessTokenExpiresOn: account.expires_at,
            refreshToken: account.refresh_token,
            user
          }
        }

        // If the access token is valid, return it.
        if (Date.now() < token.accessTokenExpiresOn) return token

        // Otherwise, refresh the token.
        const TokenResult = await UseRefreshToken(token.refreshToken)

        return {
          ...token,
          accessToken: TokenResult.access_token,
          accessTokenExpiresOn: Date.now() + TokenResult.expires_in * 1000,
          refreshToken: TokenResult.refresh_token ?? token.refreshToken
        }
      },
      async session({ session, token }) {
        session.user = token.user
        session.accessToken = token.accessToken
        return session
      }
    },
    secret: SESSION_SECRET
  })
}

export async function UseRefreshToken(refreshToken: string) {
  const {
    serverRuntimeConfig: { DISCORD_CLIENT_SECRET, DISCORD_CLIENT_ID }
  } = getConfig()

  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope
    }),
    method: 'POST'
  })

  return (await response.json()) as AccessTokenResponse
}

type AccessTokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}
