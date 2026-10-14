import { NextResponse } from "next/server";

/** Identity providers brokered through Keycloak. Mirrors IDP_HINTS in the users service. */
const SUPPORTED_IDPS = ["google", "microsoft"] as const;

type SupportedIdp = (typeof SUPPORTED_IDPS)[number];

const isSupportedIdp = (value: string): value is SupportedIdp =>
  (SUPPORTED_IDPS as readonly string[]).includes(value);

/**
 * Proxies the backend's identity-provider authorization URL.
 *
 * Kept server-side so `AUTH_BACKEND_URL` is never exposed to the browser, matching the
 * existing `app/api/auth/google/route.ts`.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ idp: string }> },
) {
  const { idp } = await params;

  if (!isSupportedIdp(idp)) {
    return NextResponse.json(
      { error: `Unsupported identity provider: ${idp}` },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${process.env.AUTH_BACKEND_URL}/auth/idp/${idp}`);

    if (!res.ok) {
      console.error(`Backend rejected IdP URL request for ${idp}:`, res.status);
      return NextResponse.json(
        { error: "Failed to fetch login URL" },
        { status: res.status },
      );
    }

    return NextResponse.json(await res.json());
  } catch (error) {
    console.error(`Error fetching ${idp} auth URL:`, error);
    return NextResponse.json(
      { error: "Failed to fetch login URL" },
      { status: 500 },
    );
  }
}
