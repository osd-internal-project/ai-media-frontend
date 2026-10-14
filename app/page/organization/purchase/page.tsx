import { Suspense } from "react";
import { Spin } from "antd";
import PurchaseClient from "./PurchaseClient";

/** Purchase form entry — Suspense wraps the client for useSearchParams. */
export default function PurchasePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      }
    >
      <PurchaseClient />
    </Suspense>
  );
}
