import { cookies } from "next/headers";
import SessionProvider from "./components/SessionProvider";
import { ThemeProvider, type ThemeMode } from "./components/ThemeProvider";
import "./globals.css";
export const metadata = {
  title: "AI CAVE",
  description: "AI-Media Application",
  // robots: {
  //   index: false,
  //   follow: false,
  // },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read on the server so the first paint already uses the saved theme.
  const initialMode: ThemeMode =
    (await cookies()).get("theme")?.value === "light" ? "light" : "dark";

  return (
    <html lang="en" className={`theme-${initialMode}`}>
      <body>
        <ThemeProvider initialMode={initialMode}>
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
