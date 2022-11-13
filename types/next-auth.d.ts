import NextAuth, { User } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken: string
    user: User
  }

  interface Account {
    provider: string
    type: string
    providerAccountId: string
    access_token: string
    expires_at: number
    refresh_token: string
    scope: string
    token_type: string
  }

  interface User {
    id: string
    name: string
    image: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string
    accessTokenExpiresOn: number
    refreshToken: string
    user: User
  }
}
