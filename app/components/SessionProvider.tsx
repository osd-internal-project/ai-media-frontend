"use client";

import {
  SessionProvider as NextAuthSessionProvider,
  useSession,
  signOut,
} from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { axiosUser } from "../lib/axios/axios";
import AuthService from "../services/auth.service";

// Component to monitor session expiration
function SessionExpirationMonitor() {
  const { data: session, status } = useSession();
  const authService = AuthService(axiosUser);

  useEffect(() => {
    // Only run if we have a session
    if (status !== "authenticated" || !session) {
      return;
    }

    // Check if session has an error (like RefreshAccessTokenError)
    if ((session as any)?.error === "RefreshAccessTokenError") {
      console.log("Session refresh failed, logging out...");
      signOut({ callbackUrl: "/login?error=session_expired" });
      return;
    }

    // Function to check token expiration and SSO session
    const checkTokenExpiration = async () => {
      const currentTime = Date.now();
      const accessToken = (session as any)?.accessToken;

      if (!accessToken) {
        console.log("No access token found, logging out...");
        signOut({ callbackUrl: "/login?error=no_token" });
        return;
      }

      // Step 1: Quick client-side JWT expiration check
      try {
        const parts = accessToken.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1], "base64").toString(),
          );
          const expiresAt = payload.exp * 1000; // Convert to milliseconds

          // If access token is expired, logout immediately
          if (currentTime >= expiresAt) {
            console.log("Access token has expired, logging out...");
            signOut({ callbackUrl: "/login?error=token_expired" });
            return;
          }
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }

      // Step 2: Validate SSO session with Keycloak
      // This checks against SSO Session Idle (30min) and SSO Session Max (10h)
      try {
        const response = await authService.validate(accessToken);

        // Case 1: No response (network error or API failure)
        if (!response) {
          console.log(
            "Token validation API failed (no response), logging out...",
          );
          signOut({ callbackUrl: "/login?error=validation_failed" });
          return;
        }

        // Case 2: Response received but valid is false (SSO session expired)
        if (response.valid === false) {
          console.log(
            "SSO session has expired (idle timeout or max session), logging out...",
          );
          signOut({ callbackUrl: "/login?error=sso_session_expired" });
          return;
        }

        // Case 3: Response received and valid is true (session active)
        if (response.valid === true) {
          console.log("SSO session is valid");
        } else {
          // Unexpected response format
          console.warn("Unexpected validation response format:", response);
          signOut({ callbackUrl: "/login?error=validation_failed" });
        }
      } catch (error) {
        console.error("Error validating SSO session:", error);
        // Don't logout on network errors, just log it
        // The next check will catch it if it's a real session issue
      }
    };

    // Check immediately on mount (validates SSO session on page load)
    checkTokenExpiration();

    // Set up periodic checks every 5 minutes
    // This allows SSO Idle timeout (30 min) to work properly
    // If validation is too frequent (e.g. 1 min), it will reset SSO Idle constantly
    const intervalId = setInterval(checkTokenExpiration, 5 * 60000);

    return () => clearInterval(intervalId);
  }, [session, status, authService]);

  return null;
}

export default function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider
      refetchInterval={4 * 60} // 4 minutes - triggers jwt callback to check/refresh tokens
      refetchOnWindowFocus={true}
    >
      <SessionExpirationMonitor />
      {children}
    </NextAuthSessionProvider>
  );
}
