import type { ReactNode } from "react";

/** Indigo-to-cyan type from the logo. Reserved for three spots: hero headline, Results figures, final CTA headline. */
export default function GradientText({ children, sweep = false }: { children: ReactNode; sweep?: boolean }) {
  return <span className={`l-gradient-text ${sweep ? "l-gradient-text--sweep" : ""}`}>{children}</span>;
}
