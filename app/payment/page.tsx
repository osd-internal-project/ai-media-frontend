import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import PaymentClient from "./PaymentClient";
import BillingGate from "@/app/components/BillingGate";

export const metadata: Metadata = {
  title: "Payment | AI CAVE",
  description: "Complete your package payment",
};

export default function PaymentPage() {
  return (
    <BillingGate>
      <Script src="https://cdn.omise.co/omise.js" strategy="beforeInteractive" />
      <Suspense fallback={null}>
        <PaymentClient />
      </Suspense>
    </BillingGate>
  );
}
