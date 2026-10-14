"use client";

import { Button } from "antd";
import { useRouter } from "next/navigation";

interface PaymentSuccessProps {
  chargeId: string;
}

/** Animated success panel shown after a successful charge. */
export default function PaymentSuccess({ chargeId }: PaymentSuccessProps) {
  const router = useRouter();

  return (
    <div
      className="animate-scaleIn"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: "48px 32px",
        textAlign: "center",
      }}
    >
      {/* Animated checkmark circle */}
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="46" stroke="#22C55E" strokeWidth="4" opacity="0.3" />
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke="#22C55E"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="289"
          strokeDashoffset="289"
          style={{
            animation: "checkStroke 0.6s ease-out 0.1s forwards",
          }}
        />
        <polyline
          points="28,52 44,68 72,36"
          stroke="#22C55E"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray="100"
          strokeDashoffset="100"
          className="animate-checkStroke"
        />
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            color: "#F2F4F5",
          }}
        >
          Payment Successful!
        </h2>
        <p style={{ margin: 0, color: "#8C99A9", fontSize: 15 }}>
          Your AI CAVE Pro subscription is now active.
        </p>
        <p style={{ margin: 0, color: "#3A434F", fontSize: 12, fontFamily: "monospace" }}>
          Charge ID: {chargeId}
        </p>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 320,
          background: "#21262B",
          border: "1px solid #3A434F",
          borderRadius: 12,
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {[
          ["Plan", "AI CAVE Pro"],
          ["Amount", "฿990 / month"],
          ["Status", "Active"],
        ].map(([label, val]) => (
          <div
            key={label}
            style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}
          >
            <span style={{ color: "#8C99A9" }}>{label}</span>
            <span style={{ color: label === "Status" ? "#22C55E" : "#F2F4F5", fontWeight: 600 }}>
              {val}
            </span>
          </div>
        ))}
      </div>

      <Button
        type="primary"
        size="large"
        onClick={() => router.push("/dashboard")}
        style={{
          background: "linear-gradient(135deg, #6F6ADE 0%, #4B49A1 100%)",
          border: "none",
          borderRadius: 10,
          height: 48,
          padding: "0 40px",
          fontSize: 15,
          fontWeight: 600,
          color: "#fff",
          marginTop: 8,
        }}
      >
        Go to Dashboard
      </Button>
    </div>
  );
}
