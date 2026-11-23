import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authOptions } from "./options";
const handler = NextAuth(authOptions as any);

// Keycloak's answers to a silent check (prompt=none, started by /login?silent=1) that found
// no SSO session: the visitor stays a guest on the landing page instead of seeing /error.
const SILENT_MISS = ["login_required", "interaction_required", "consent_required"];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> },
) {
  const error = request.nextUrl.searchParams.get("error");
  if (
    error &&
    SILENT_MISS.includes(error) &&
    request.nextUrl.pathname.endsWith("/callback/keycloak")
  ) {
    return NextResponse.redirect(new URL("/home", process.env.NEXTAUTH_URL ?? request.url));
  }
  return handler(request, context);
}

export { handler as POST };
