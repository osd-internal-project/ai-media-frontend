import { signOut } from "next-auth/react";

const fetchKeycloakLogoutUrl = async (): Promise<string> => {
  const res = await fetch("/api/auth/keycloak-logout", { cache: "no-store" });
  if (!res.ok) throw new Error(`keycloak-logout responded ${res.status}`);
  const body: unknown = await res.json();
  if (typeof body === "object" && body !== null && "url" in body && typeof body.url === "string") {
    return body.url;
  }
  throw new Error("keycloak-logout returned no url");
};

/**
 * Ends both the NextAuth session and the Keycloak SSO session, then lands on /login.
 * The Keycloak URL is read before signOut clears the session cookie that holds the id token.
 */
export async function logout(): Promise<void> {
  let keycloakLogoutUrl: string | null = null;
  try {
    keycloakLogoutUrl = await fetchKeycloakLogoutUrl();
  } catch (error) {
    // Surfaced, not hidden: the app session still ends, but Keycloak SSO may survive.
    console.error("Keycloak logout URL unavailable; ending app session only:", error);
  }

  await signOut({ redirect: false });
  window.location.href = keycloakLogoutUrl ?? "/login";
}
