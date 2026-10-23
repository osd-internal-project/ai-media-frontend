import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Returns the Keycloak end-session URL for the current session.
 *
 * The browser must visit it: only the browser carries the Keycloak SSO cookie, so a
 * server-side logout leaves that session alive and /login signs the user straight back in.
 */
export async function GET(request: NextRequest) {
  const issuer = process.env.KEYCLOAK_ISSUER;
  const clientId = process.env.KEYCLOAK_CLIENT_ID;
  const appUrl = process.env.NEXTAUTH_URL;

  if (!issuer || !clientId || !appUrl) {
    console.error("Keycloak logout is not configured: missing issuer, client id or app URL");
    return NextResponse.json(
      { error: "Keycloak logout is not configured" },
      { status: 500 },
    );
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // `/login` is registered as a post-logout redirect URI on the client; `/` is rejected (400).
  const params = new URLSearchParams({
    client_id: clientId,
    post_logout_redirect_uri: `${appUrl}/login`,
  });
  // Without id_token_hint (brokered IdP sessions may lack one) Keycloak asks the user to confirm.
  if (typeof token?.idToken === "string") {
    params.set("id_token_hint", token.idToken);
  }

  return NextResponse.json(
    { url: `${issuer}/protocol/openid-connect/logout?${params.toString()}` },
    { headers: { "Cache-Control": "no-store" } },
  );
}
