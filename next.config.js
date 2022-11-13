/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true
  },
  serverRuntimeConfig: {
    SESSION_SECRET: process.env.SESSION_SECRET,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET
  },
  publicRuntimeConfig: {
    API_URL: process.env.API_URL,
    WS_URL: process.env.WS_URL
  },
  images: {
    domains: ['cdn.discordapp.com']
  }
}

module.exports = nextConfig
