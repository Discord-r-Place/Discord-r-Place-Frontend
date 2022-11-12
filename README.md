# Discord-r-Place-Frontend

## Setup
Make sure to create a Discord application and note down the client id and client secret.
Add discord login callback to the Redirects on the OAuth2 page of the application. e.g. `http://localhost/api/auth/callback/discord`

## Environment Variables

| Name                  | Description                                  | Required | Default |
| --------------------- | -------------------------------------------- | -------- | ------- |
| SESSION_SECRET        | The secret to encrypt the cookies with       | Yes      |         |
| DISCORD_CLIENT_ID     | The client id of the discord application     | Yes      |         |
| DISCORD_CLIENT_SECRET | The client secret of the discord application | Yes      |         |
