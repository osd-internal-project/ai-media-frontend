import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const DEFAULT_CALLBACK_URL = "/page/project";

/** Redirect within this app, using the public origin rather than the pod's internal host. */
const appRedirect = (request: NextRequest, path: string) =>
  NextResponse.redirect(new URL(path, process.env.NEXTAUTH_URL ?? request.url));

/**
 * Sends the browser straight to the Keycloak login page.
 *
 * next-auth v4 only starts OAuth from a CSRF-protected POST, so this handler performs
 * that POST server-side and forwards next-auth's state/PKCE cookies with the redirect.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const error = params.get("error");
  if (error) {
    return appRedirect(request, `/error?error=${encodeURIComponent(error)}`);
  }

  const internalUrl =
    process.env.NEXTAUTH_URL_INTERNAL || process.env.NEXTAUTH_URL;
  if (!internalUrl) {
    console.error("Login redirect: NEXTAUTH_URL_INTERNAL / NEXTAUTH_URL not set");
    return appRedirect(request, "/error?error=Configuration");
  }

  try {
    const csrfRes = await fetch(`${internalUrl}/api/auth/csrf`, {
      cache: "no-store",
    });
    if (!csrfRes.ok) {
      throw new Error(`csrf request failed with ${csrfRes.status}`);
    }
    const { csrfToken } = (await csrfRes.json()) as { csrfToken?: string };
    if (!csrfToken) {
      throw new Error("csrf response has no csrfToken");
    }
    const csrfCookies = csrfRes.headers.getSetCookie();

    const signinRes = await fetch(`${internalUrl}/api/auth/signin/keycloak`, {
      method: "POST",
      cache: "no-store",
      redirect: "manual",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Only name=value goes back in a Cookie header, not the attributes.
        Cookie: csrfCookies.map((cookie) => cookie.split(";")[0]).join("; "),
      },
      body: new URLSearchParams({
        csrfToken,
        callbackUrl: params.get("callbackUrl") || DEFAULT_CALLBACK_URL,
        json: "true",
      }),
    });
    if (!signinRes.ok) {
      throw new Error(`signin request failed with ${signinRes.status}`);
    }
    const { url } = (await signinRes.json()) as { url?: string };
    if (!url || !url.startsWith(process.env.KEYCLOAK_ISSUER ?? "")) {
      throw new Error(`signin did not return a Keycloak URL: ${url}`);
    }

    const response = NextResponse.redirect(url);
    response.headers.set("Cache-Control", "no-store");
    // Both responses set next-auth.callback-url; keep only the latest per cookie name.
    const cookiesByName = new Map<string, string>();
    for (const cookie of [...csrfCookies, ...signinRes.headers.getSetCookie()]) {
      cookiesByName.set(cookie.split("=")[0], cookie);
    }
    for (const cookie of cookiesByName.values()) {
      response.headers.append("Set-Cookie", cookie);
    }
    return response;
  } catch (err) {
    console.error("Login redirect to Keycloak failed:", err);
    return appRedirect(request, "/error?error=OAuthSignin");
  }
}
