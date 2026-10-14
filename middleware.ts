import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (static images)
     * - error (error page)
     * - add-user (add user page)
     * - signup (signup page)
     * - login (login page)
     * - signin (signin page)
     * - package (package page)
     */
    "/page/:path*",
    "/event/:path*",
    // "/((?!api|_next/static|_next/image|favicon.ico|images|error|add-user|signup|login|signin|package).*)",
  ],
};
