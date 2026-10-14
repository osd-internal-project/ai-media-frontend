import { Suspense } from "react";
import { Skeleton } from "antd";
import DashboardClient from "./DashboardClient";

/**
 * The dashboard reads its filter state from the URL via `useSearchParams`, which Next.js
 * requires to sit inside a Suspense boundary. Mirrors the pattern used by the checkout and
 * purchase pages.
 */
export default function DashboardPage() {
  return (
    <Suspense fallback={<Skeleton active className="p-6" />}>
      <DashboardClient />
    </Suspense>
  );
}
