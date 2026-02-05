import KeycloakProvider from "next-auth/providers/keycloak";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import config from "../../../config";
import { decryptPassword } from "../../../utils/crypto";

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

    // Decode refresh token to check if it's expired
    try {
      const parts = String(token.refreshToken).split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        const refreshTokenExp = payload.exp * 1000;

        // If refresh token is expired, don't attempt refresh
        if (Date.now() >= refreshTokenExp) {
          console.error("❌ Refresh token has expired");
          return {
            ...token,
            error: "RefreshAccessTokenError",
          };
        }
      }
    } catch (decodeError) {
      console.error("Error decoding refresh token", decodeError);
    }

    console.log("📡 Calling Keycloak token endpoint...");
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

    const newExpiresAt = Date.now() + refreshedTokens.expires_in * 1000;

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: newExpiresAt,
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
    CredentialsProvider({
      name: "Keycloak",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const decryptedPassword = decryptPassword(
            credentials?.password || "",
          );

          // Call the backend service for login
          const url = `${config.backendUserUrl}/auth/login`;
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: credentials?.username,
              password: decryptedPassword,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            console.error("Login failed:", data);
            return null;
          }

          return {
            id: data.sub || "user",
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
            idToken: data.id_token,
            organizationId: data.recentOrganizationId,
            userId: data.userId,
            systemRole: data.role,
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

          const url = `${config.backendUserUrl}/auth/check`;
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          if (!response.ok) return false;

          const data = await response.json();
          if (!data.exists) {
            // Redirect to login with error message if user not found in DB
            // Note: Returning a string redirects in NextAuth v4
            return "/login?error=403";
          }

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

      // Check if token needs refresh
      const now = Date.now();
      const expiresAt = token.expiresAt as number;
      const timeUntilExpiry = expiresAt - now;
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

      // Refresh token if it expires in less than 5 minutes
      if (timeUntilExpiry < fiveMinutes) {
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
