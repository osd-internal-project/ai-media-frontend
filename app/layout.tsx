import EnvVarProvider from "./components/EnvVarProvider";
import SessionProvider from "./components/SessionProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publicEnv = {
    NEXT_PUBLIC_API_BASE_URL_USER: process.env.NEXT_PUBLIC_API_BASE_URL_USER,
    NEXT_PUBLIC_API_BASE_URL_CORE: process.env.NEXT_PUBLIC_API_BASE_URL_CORE,
    NEXT_PUBLIC_API_BASE_URL_REPORT:
      process.env.NEXT_PUBLIC_API_BASE_URL_REPORT,
    NEXT_PUBLIC_API_BASE_URL_WORKER:
      process.env.NEXT_PUBLIC_API_BASE_URL_WORKER,
    NEXT_PUBLIC_API_BASE_URL_WEB_HOOK:
      process.env.NEXT_PUBLIC_API_BASE_URL_WEB_HOOK,
    NEXT_PUBLIC_VERSION: process.env.NEXT_PUBLIC_VERSION,
    NEXT_PUBLIC_CRYPTO_SECRET: process.env.NEXT_PUBLIC_CRYPTO_SECRET,
    AUTH_BACKEND_URL: process.env.AUTH_BACKEND_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    // Add other variables you need on the client here
  };

  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <EnvVarProvider env={publicEnv} />
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
