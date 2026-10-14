"use client";

import type { ReactNode } from "react";

interface ProtectedMediaProps {
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Discourages common browser copy and save interactions for public media.
 *
 * This is intentionally a client component so the public feed and post pages
 * can remain server-rendered for their metadata.
 */
export default function ProtectedMedia({
  children,
  className,
}: ProtectedMediaProps) {
  return (
    <div
      className={className}
      onContextMenu={(event) => event.preventDefault()}
      onCopy={(event) => event.preventDefault()}
      onCut={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    >
      {children}
    </div>
  );
}
