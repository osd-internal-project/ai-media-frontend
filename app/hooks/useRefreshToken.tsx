"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useRefreshToken() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if ((session as any)?.error === "RefreshAccessTokenError") {
      router.push("/signin");
    }
  }, [session, router]);

  return { session, status };
}
