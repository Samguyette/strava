import { AuthOptions } from "next-auth"
import StravaProvider from "next-auth/providers/strava"

export const authOptions: AuthOptions = {
  providers: [
    StravaProvider({
      clientId: process.env.STRAVA_CLIENT_ID!,
      clientSecret: process.env.STRAVA_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "activity:read_all",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at as number
      }

      // Refresh access token if expired
      if (token.expiresAt && Date.now() / 1000 > token.expiresAt) {
        try {
          const res = await fetch("https://www.strava.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client_id: process.env.STRAVA_CLIENT_ID,
              client_secret: process.env.STRAVA_CLIENT_SECRET,
              grant_type: "refresh_token",
              refresh_token: token.refreshToken,
            }),
          })
          const refreshed = await res.json()
          token.accessToken = refreshed.access_token
          token.refreshToken = refreshed.refresh_token
          token.expiresAt = refreshed.expires_at
        } catch {
          return { ...token, error: "RefreshAccessTokenError" }
        }
      }

      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      return session
    },
  },
}
