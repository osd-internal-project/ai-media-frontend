"use client";

import CardBrandIcon from "./CardBrandIcon";

const FEATURES = [
  "Unlimited AI image generation",
  "Video generation (up to 60s)",
  "Priority GPU queue",
  "All model types: Flux, SDXL, Seedream",
  "Commercial license included",
  "24/7 priority support",
];

/** Left panel: plan name, pricing, feature checklist, and trust badges. */
export default function PlanSummaryPanel() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 32,
        padding: "48px 40px",
        background: "linear-gradient(160deg, #21262B 0%, #1a1f26 100%)",
        borderRight: "1px solid #2A3038",
        minHeight: "100%",
      }}
    >
      {/* Logo + brand */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.15em",
            color: "#0FEAB6",
            textTransform: "uppercase",
          }}
        >
          AI CAVE
        </span>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#F2F4F5" }}>
          Pro Plan
        </h1>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: 42, fontWeight: 800, color: "#6F6ADE" }}>฿990</span>
          <span style={{ color: "#8C99A9", fontSize: 14 }}>/ month</span>
        </div>
        <p style={{ margin: 0, color: "#8C99A9", fontSize: 13, lineHeight: 1.5 }}>
          Billed monthly. Cancel any time.
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#2A3038" }} />

      {/* Feature list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#8C99A9", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          What's included
        </h3>
        {FEATURES.map((feature) => (
          <div key={feature} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="9" fill="#0FEAB6" opacity="0.15" />
              <polyline
                points="5,9.5 7.5,12 13,7"
                stroke="#0FEAB6"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ color: "#F2F4F5", fontSize: 14 }}>{feature}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#2A3038" }} />

      {/* Trust badges */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#8C99A9", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Secure payment by
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Omise badge */}
          <div
            style={{
              background: "#2A3038",
              border: "1px solid #3A434F",
              borderRadius: 8,
              padding: "6px 14px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="7" stroke="#0FEAB6" strokeWidth="1.5" />
              <path d="M5 8.5l2 2 4-4" stroke="#0FEAB6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ color: "#8C99A9", fontSize: 12, fontWeight: 600 }}>Omise</span>
          </div>

          {/* Card brand logos */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {(["visa", "mastercard", "jcb"] as const).map((brand) => (
              <div
                key={brand}
                style={{
                  background: brand === "visa" ? "#fff" : "#2A3038",
                  border: "1px solid #3A434F",
                  borderRadius: 6,
                  padding: "4px 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 32,
                }}
              >
                <CardBrandIcon brand={brand} className={brand === "visa" ? "h-3" : "h-5"} />
              </div>
            ))}
          </div>
        </div>

        {/* SSL note */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <rect x="2" y="5" width="9" height="7" rx="1.5" stroke="#3A434F" strokeWidth="1.2" />
            <path d="M4 5V4a2.5 2.5 0 0 1 5 0v1" stroke="#3A434F" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="6.5" cy="8.5" r="1" fill="#3A434F" />
          </svg>
          <span style={{ color: "#3A434F", fontSize: 11 }}>
            256-bit SSL encrypted. We never store your card details.
          </span>
        </div>
      </div>
    </div>
  );
}
