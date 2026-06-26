import { Suspense } from "react";
import { Spin } from "antd";
import CheckoutClient from "./CheckoutClient";

/** Checkout entry — wraps the client component in Suspense for useSearchParams. */
export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
