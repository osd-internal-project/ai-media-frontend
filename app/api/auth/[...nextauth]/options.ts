import KeycloakProvider from "next-auth/providers/keycloak";
import { JWT } from "next-auth/jwt";

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: String(token.refreshToken),
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER,
      authorization: {
        params: {
          scope: "openid email profile roles",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }: any) {
      // Initial sign in
      if (account && profile) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.expiresAt = account.expires_at! * 1000;

        // Extract roles from Keycloak token
        const decodedToken = JSON.parse(Buffer.from(account.access_token!.split(".")[1], "base64").toString());

        // Get realm roles
        token.roles = decodedToken.realm_access?.roles || [];

        // Get groups (if configured in Keycloak)
        token.groups = decodedToken.groups || [];

        return token;
      }

      // Return previous token if not expired
      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }: any) {
      // Send properties to the client
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.user.roles = token.roles;
      session.user.groups = token.groups;
      session.user.id = token.sub!;

      return session;
    },
  },
  events: {
    async signOut({ token }: any) {
      if (token.idToken) {
        const issuerUrl = process.env.KEYCLOAK_ISSUER;
        const logOutUrl = `${issuerUrl}/protocol/openid-connect/logout`;
        const params = new URLSearchParams({
          id_token_hint: token.idToken as string,
          post_logout_redirect_uri: process.env.NEXTAUTH_URL!,
        });
        try {
          await fetch(`${logOutUrl}?${params.toString()}`);
        } catch (err) {
          console.error("Error during Keycloak logout:", err);
        }
      }
    },
  },
  pages: {
    signIn: "/signin",
    error: "/error",
  },
  session: {
    strategy: "jwt",
  },
};
