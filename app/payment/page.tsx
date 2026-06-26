import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import PaymentClient from "./PaymentClient";

export const metadata: Metadata = {
  title: "Payment | AI CAVE",
  description: "Complete your package payment",
};

export default function PaymentPage() {
  return (
    <>
      <Script src="https://cdn.omise.co/omise.js" strategy="beforeInteractive" />
      <Suspense fallback={null}>
        <PaymentClient />
      </Suspense>
    </>
  );
}
