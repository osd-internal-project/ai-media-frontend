import { Prompt } from "next/font/google";

/** ฟอนต์ของจอ event และหน้า share — ใช้ผ่าน CSS variable เพราะ globals.css บังคับ font-family ด้วย !important */
export const kioskSans = Prompt({
  subsets: ["thai", "latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-kiosk-sans",
  display: "swap",
});

export const kioskFontVariables = kioskSans.variable;
