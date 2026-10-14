"use client";

import { notFound } from "next/navigation";
import { useSession } from "next-auth/react";
import { canSeeBilling } from "../utils/permissions";

/**
 * Hides a billing page from everyone but SUPER_ADMIN while the feature is off.
 * Waits for the session — deciding while it loads would 404 a SUPER_ADMIN.
 */
export default function BillingGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!canSeeBilling(session?.user?.systemRole)) {
    notFound();
  }

  return <>{children}</>;
}
