import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
  }

  interface Session {
    /** Keycloak access token — backend ตรวจด้วย KeycloakAuthGuard */
    accessToken?: string;
    /** "RefreshAccessTokenError" เมื่อต่ออายุ token ไม่ได้ → ต้อง login ใหม่ */
    error?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
      organizationId?: string | null;
      userId?: string | null;
      systemRole?: string | null;
    };
  }
}
