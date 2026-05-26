"use client";

import { useState } from "react";
import CardPaymentForm from "./components/CardPaymentForm";
import PaymentSuccess from "./components/PaymentSuccess";
import PlanSummaryPanel from "./components/PlanSummaryPanel";
import { useOmiseToken } from "./hooks/useOmiseToken";
import type { CardData } from "./hooks/useOmiseToken";

type PaymentState = "idle" | "loading" | "success" | "error";

/** Root client component: owns payment state and orchestrates tokenize → charge flow. */
export default function PaymentClient() {
  const { tokenize } = useOmiseToken();
  const [state, setState] = useState<PaymentState>("idle");
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (cardData: CardData) => {
    setState("loading");
    setErrorMessage(null);

    try {
      // Step 1: tokenize card client-side with Omise.js — raw card data never reaches our server
      const token = await tokenize(cardData);

      // Step 2: send only the token to our API route
      const res = await fetch("/api/payment/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = (await res.json()) as {
        success: boolean;
        chargeId?: string;
        message?: string;
      };

      if (data.success && data.chargeId) {
        setChargeId(data.chargeId);
        setState("success");
      } else {
        setErrorMessage(data.message ?? "Payment was declined. Please try another card.");
        setState("error");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
      setState("error");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#191C20",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      {/* Responsive card: stacked on mobile, side-by-side on ≥700px */}
      <style>{`
        .payment-card {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          width: 100%;
          max-width: 860px;
          background: #21262B;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }
        @media (min-width: 700px) {
          .payment-card { grid-template-columns: 340px minmax(0, 1fr); }
          .payment-plan-col { display: flex !important; }
        }
        .payment-plan-col { display: none; }
        .payment-form-col {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
      `}</style>

      <div className="payment-card animate-fadeUp">
        {/* Left: plan summary — hidden on mobile */}
        <div className="payment-plan-col">
          <PlanSummaryPanel />
        </div>

        {/* Right: form or success */}
        <div className="payment-form-col animate-fadeUp animate-fadeUp-d1">
          {state === "success" && chargeId ? (
            <PaymentSuccess chargeId={chargeId} />
          ) : (
            <CardPaymentForm
              onSubmit={handleSubmit}
              loading={state === "loading"}
              errorMessage={state === "error" ? errorMessage : null}
            />
          )}
        </div>
      </div>
    </div>
  );
}
