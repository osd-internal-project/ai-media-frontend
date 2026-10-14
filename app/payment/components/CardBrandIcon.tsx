"use client";

/** Detects card brand from the first digits of a card number. */
export function detectBrand(number: string): "visa" | "mastercard" | "jcb" | null {
  const n = number.replace(/\s/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^(51|52|53|54|55|2[2-7])/.test(n)) return "mastercard";
  if (/^35/.test(n)) return "jcb";
  return null;
}

interface CardBrandIconProps {
  brand: "visa" | "mastercard" | "jcb" | null;
  className?: string;
}

/** SVG card brand logos for Visa, Mastercard, and JCB. */
export default function CardBrandIcon({ brand, className = "" }: CardBrandIconProps) {
  if (!brand) return null;

  if (brand === "visa") {
    return (
      <svg
        className={className}
        viewBox="0 0 48 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Visa"
        role="img"
      >
        <text
          x="0"
          y="14"
          fontFamily="Arial, sans-serif"
          fontSize="16"
          fontWeight="700"
          fontStyle="italic"
          fill="#1A1F71"
          letterSpacing="-0.5"
        >
          VISA
        </text>
      </svg>
    );
  }

  if (brand === "mastercard") {
    return (
      <svg
        className={className}
        viewBox="0 0 38 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Mastercard"
        role="img"
      >
        <circle cx="14" cy="12" r="10" fill="#EB001B" />
        <circle cx="24" cy="12" r="10" fill="#F79E1B" />
        <path
          d="M19 5.4A10 10 0 0 1 22.9 12 10 10 0 0 1 19 18.6 10 10 0 0 1 15.1 12 10 10 0 0 1 19 5.4z"
          fill="#FF5F00"
        />
      </svg>
    );
  }

  // JCB
  return (
    <svg
      className={className}
      viewBox="0 0 38 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="JCB"
      role="img"
    >
      <rect width="38" height="24" rx="3" fill="#003087" />
      <rect x="6" y="4" width="8" height="16" rx="4" fill="url(#jcb-b)" />
      <rect x="15" y="4" width="8" height="16" rx="4" fill="url(#jcb-g)" />
      <rect x="24" y="4" width="8" height="16" rx="4" fill="url(#jcb-r)" />
      <text x="8.5" y="15.5" fontFamily="Arial" fontSize="7" fontWeight="700" fill="white">J</text>
      <text x="17.5" y="15.5" fontFamily="Arial" fontSize="7" fontWeight="700" fill="white">C</text>
      <text x="26.5" y="15.5" fontFamily="Arial" fontSize="7" fontWeight="700" fill="white">B</text>
      <defs>
        <linearGradient id="jcb-b" x1="6" y1="4" x2="14" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#003087" />
          <stop offset="1" stopColor="#009BDE" />
        </linearGradient>
        <linearGradient id="jcb-g" x1="15" y1="4" x2="23" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#007B40" />
          <stop offset="1" stopColor="#55B330" />
        </linearGradient>
        <linearGradient id="jcb-r" x1="24" y1="4" x2="32" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#CC0000" />
          <stop offset="1" stopColor="#FF6600" />
        </linearGradient>
      </defs>
    </svg>
  );
}
