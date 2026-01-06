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
     * - error (error page)
     * - add-user (add user page)
     * - signup (signup page)
     * - login (login page)
     * - signin (signin page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|error|add-user|signup|login|signin).*)",
  ],
};
