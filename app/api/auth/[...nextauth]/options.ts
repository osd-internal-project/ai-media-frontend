import KeycloakProvider from "next-auth/providers/keycloak";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import config from "../../../config";

if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

/**
 * Verifies an access token against Keycloak via the backend's introspection endpoint.
 *
 * Fails closed: any network error, non-2xx response, or `valid !== true` rejects the
 * sign-in. Treating an unreachable backend as "valid" would reopen the forgery hole this
 * guards against.
 *
 * @param accessToken The bearer token supplied to the credentials provider.
 * @returns True only when Keycloak confirms the token is active.
 */
async function validateAccessToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${config.backendAuthUrl}/auth/validate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data?.valid === true;
  } catch (error) {
    console.error("Access token validation failed:", error);
    return false;
  }
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  console.log("🔄 Starting token refresh process...");

  try {
    // Check if refresh token exists
    if (!token.refreshToken) {
      console.error("❌ No refresh token available");
      return {
        ...token,
        error: "RefreshAccessTokenError",
      };
    }

    // // Decode refresh token to check if it's expired
    // try {
    //   const parts = String(token.refreshToken).split(".");
    //   if (parts.length === 3) {
    //     const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    //     const refreshTokenExp = payload.exp * 1000;

    //     // If refresh token is expired, don't attempt refresh
    //     if (Date.now() >= refreshTokenExp) {
    //       console.error("❌ Refresh token has expired");
    //       return {
    //         ...token,
    //         error: "RefreshAccessTokenError",
    //       };
    //     }
    //   }
    // } catch (decodeError) {
    //   console.error("Error decoding refresh token", decodeError);
    // }

    // console.log("📡 Calling Keycloak token endpoint...");
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

    const contentType = response.headers.get("content-type");
    const refreshedTokens = contentType?.includes("application/json")
      ? await response.json()
      : response;

    if (!response.ok) {
      throw refreshedTokens;
    }

    // const newExpiresAt = Date.now() + refreshedTokens.expires_in * 1000;

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      // expiresAt: newExpiresAt,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("❌ Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER,
      authorization: {
        params: {
          scope: "openid email profile roles offline_access",
        },
      },
    }),
    // Brokered-IdP entry point only. Sign-in with a username/password (ROPC) was removed
    // in favour of the Keycloak authorization-code flow above.
    CredentialsProvider({
      name: "Keycloak",
      credentials: {
        accessToken: { label: "Access Token", type: "text" },
        refreshToken: { label: "Refresh Token", type: "text" },
        idToken: { label: "ID Token", type: "text" },
        expiresIn: { label: "Expires In", type: "text" },
        organizationId: { label: "Organization ID", type: "text" },
        userId: { label: "User ID", type: "text" },
        systemRole: { label: "System Role", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.accessToken) return null;

          // This branch is how brokered IdP logins (Google, Microsoft) enter NextAuth:
          // /callback exchanges the code with the backend, then signs in with the
          // resulting token. The token MUST be introspected here — without it, posting an
          // arbitrary string to /api/auth/callback/credentials mints a valid session.
          const isValid = await validateAccessToken(credentials.accessToken);
          if (!isValid) {
            console.error("Rejected credentials sign-in: access token is not valid");
            return null;
          }

          return {
            accessToken: credentials.accessToken,
            refreshToken: credentials.refreshToken,
            idToken: credentials.idToken,
            id: credentials.userId || "user",
            expiresIn: credentials.expiresIn,
            organizationId: credentials.organizationId,
            userId: credentials.userId,
            systemRole: credentials.systemRole,
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      // 1. Google/Keycloak Login Flow
      if (account?.provider === "keycloak") {
        try {
          // Keycloak usually returns email in 'user.email'
          const email = user.email;
          if (!email) return false;

          const url = `${config.backendAuthUrl}/auth/check`;
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          if (!response.ok) return false;

          let data = await response.json();
          if (!data.exists) {
            // First SSO sign-in: the backend creates the user from the verified Keycloak token
            const provision = await fetch(
              `${config.backendAuthUrl}/auth/sso/provision`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken: account.access_token }),
              },
            );
            // Note: Returning a string redirects in NextAuth v4
            if (!provision.ok) return "/error?error=403";
            data = await provision.json();
          }

          // The Keycloak token carries no local identity, so /auth/check is the only
          // place these reach the session. The jwt callback reads them off `user`.
          user.userId = data.userId;
          user.systemRole = data.role;
          user.organizationId = data.recentOrganizationId;

          return true;
        } catch (error) {
          console.error("Error checking user existence:", error);
          return false;
        }
      }
      // 2. Credentials Login Flow (already validated in authorize)
      return true;
    },
    async jwt({ token, account, user, profile, trigger, session }: any) {
      if (trigger === "update" && session?.user?.organizationId) {
        token.organizationId = session.user.organizationId;
      }

      // Initial sign in from Keycloak Provider (Google or standard Keycloak)
      if (account && profile) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.expiresAt = account.expires_at! * 1000;
        // Local identity resolved by the signIn callback via /auth/check — the session
        // callback reads these three, and every role gate depends on systemRole.
        token.userId = user?.userId;
        token.systemRole = user?.systemRole;
        token.organizationId = user?.organizationId;
        // Extract roles safely
        if (account.access_token) {
          try {
            const parts = account.access_token.split(".");
            if (parts.length === 3) {
              const decodedToken = JSON.parse(
                Buffer.from(parts[1], "base64").toString(),
              );
              // token.roles = decodedToken.realm_access?.roles || [];
              token.groups = decodedToken.groups || [];
              token.sub = decodedToken.sub;
              token.name = decodedToken.name;
              token.email = decodedToken.email;
              token.role = decodedToken.role;
            }
          } catch (e) {
            console.error("Failed to decode token", e);
          }
        }

        return token;
      }

      // Initial sign in from Credentials Provider (Backend Login)
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.expiresAt = Date.now() + user.expiresIn * 1000;
        token.idToken = user.idToken;
        token.organizationId = user.organizationId;
        token.userId = user.userId;
        token.systemRole = user.systemRole;

        // Decode token from backend
        if (user.accessToken) {
          try {
            const parts = user.accessToken.split(".");
            if (parts.length === 3) {
              const decodedToken = JSON.parse(
                Buffer.from(parts[1], "base64").toString(),
              );
              token.roles = decodedToken.realm_access?.roles || [];
              token.groups = decodedToken.groups || [];
              token.sub = decodedToken.sub;
              token.name = decodedToken.name;
              token.email = decodedToken.email;
            }
          } catch (e) {
            console.error("Failed to decode user token from backend", e);
          }
        }

        return token;
      }

      // ต่ออายุก่อนหมด 5 นาที — backend ตรวจ access token ทุก request แล้ว (KeycloakAuthGuard)
      const expiresAt = Number(token.expiresAt);
      const fiveMinutes = 5 * 60 * 1000;
      if (Number.isFinite(expiresAt) && expiresAt - Date.now() < fiveMinutes) {
        return refreshAccessToken(token);
      }

      // Token is still valid, return as is
      return token;
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      // session.user.roles = token.roles;
      session.user.groups = token.groups;
      session.user.id = token.sub!;
      session.user.role = token.role;
      session.user.organizationId = token.organizationId;
      session.user.userId = token.userId;
      session.user.systemRole = token.systemRole;
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
          post_logout_redirect_uri: `${process.env.NEXTAUTH_URL}/`,
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
    signIn: "/login",
    error: "/error",
  },
  session: {
    strategy: "jwt",
  },
};
