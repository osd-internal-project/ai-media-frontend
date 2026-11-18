import { Anuphan, Prompt } from "next/font/google";

/** UI face for the signed-in app; globals.css reads it through `--font-app-sans`. */
export const appSans = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-app-sans",
  display: "swap",
});

/** Marketing face; LandingShell points `--font-app-sans` at it for the public pages. */
export const brandSans = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-brand-sans",
  display: "swap",
});
