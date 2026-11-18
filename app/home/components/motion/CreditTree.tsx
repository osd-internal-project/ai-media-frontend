"use client";
import type { CSSProperties } from "react";
import { useCopy } from "../../i18n/LocaleProvider";
import { useInView } from "./hooks";

// Illustrative setup (labelled as such on screen): allocations add up, so each level visibly caps the one below.
const ORG = { used: 8000, total: 12000 };
const PROJECTS = [
  { used: 5000, total: 7000, members: [{ used: 2000, total: 3000 }, { used: 3000, total: 3000 }] },
  { used: 3000, total: 5000, members: [{ used: 3000, total: 4000 }] },
];

const EASE = "cubic-bezier(0.16,1,0.3,1)";

function Bar({ used, total, on, delay }: { used: number; total: number; on: boolean; delay: number }) {
  const full = used >= total;
  return (
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-(--l-raised)">
      <div
        data-motion="move"
        className={`h-full origin-left rounded-full ${full ? "bg-(--l-warn)" : "bg-(--l-primary)"}`}
        style={{ transform: `scaleX(${on ? used / total : 0})`, transition: `transform 1s ${EASE} ${delay}ms` }}
      />
    </div>
  );
}

/** Vertical connector. While the tree is on screen, Credit dots travel down it. */
function Stem({ on, className = "" }: { on: boolean; className?: string }) {
  return (
    <div className={`relative mx-auto h-9 w-px bg-(--tree-line) ${className}`} aria-hidden>
      {on &&
        [0, 600, 1200].map((d) => (
          <span
            key={d}
            data-flow
            className="l-flow-dot absolute -left-[2px] top-0 h-[5px] w-[5px] rounded-full bg-(--l-accent)"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
    </div>
  );
}

/** Horizontal bus joining sibling columns; spans from the centre of the first column to the centre of the last. */
function Bus({ cols, className = "" }: { cols: number; className?: string }) {
  const inset = `${50 / cols}%`;
  return <div className={`absolute top-0 h-px bg-(--tree-line) ${className}`} style={{ left: inset, right: inset }} aria-hidden />;
}

function Node({
  title,
  used,
  total,
  on,
  delay,
  badge,
}: {
  title: string;
  used: number;
  total: number;
  on: boolean;
  delay: number;
  badge?: string;
}) {
  return (
    <div className="relative rounded-[14px] border border-(--l-line) bg-(--l-surface) px-3.5 py-3 text-left">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <span className="font-semibold text-(--l-ink)">{title}</span>
      </div>
      <Bar used={used} total={total} on={on} delay={delay} />
      {badge && (
        <span
          className="mt-2.5 inline-block rounded-full bg-[color-mix(in_srgb,var(--l-warn)_18%,transparent)] px-2.5 py-0.5 text-[12px] font-semibold text-(--l-warn) transition-opacity duration-300"
          style={{ opacity: on ? 1 : 0, transitionDelay: on ? "1500ms" : "0ms" }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

/** Organization → Project → Member credit, drawn as a tree: each level spends only what the level above gave it. */
export default function CreditTree({ onBand = false }: { onBand?: boolean }) {
  const { t } = useCopy();
  const tree = t.control.tree;
  const [ref, on] = useInView<HTMLElement>({ once: true, threshold: 0.3 });
  const lineVar = { "--tree-line": onBand ? "rgba(255,255,255,0.35)" : "var(--l-line)" } as CSSProperties;
  let memberIndex = 0;

  return (
    <figure ref={ref} aria-label={tree.label} style={lineVar}>
      <div className="mx-auto max-w-[320px]">
        <Node title={tree.org} used={ORG.used} total={ORG.total} on={on} delay={0} />
      </div>
      <Stem on={on} />
      <div className="relative grid gap-6 sm:grid-cols-2 sm:gap-4">
        <Bus cols={2} className="hidden sm:block" />
        {PROJECTS.map((p, pi) => (
          <div key={pi}>
            <Stem on={on} className={pi > 0 ? "h-5" : "hidden h-5 sm:block"} />
            <Node title={tree.projects[pi]} used={p.used} total={p.total} on={on} delay={300} />
            <Stem on={on} />
            <div className={`relative grid gap-3 ${p.members.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {p.members.length > 1 && <Bus cols={p.members.length} />}
              {p.members.map((m) => {
                const mi = memberIndex++;
                const reached = m.used >= m.total;
                return (
                  <div key={mi}>
                    {p.members.length > 1 && <Stem on={false} className="h-4" />}
                    <Node
                      title={tree.members[mi]}
                      used={m.used}
                      total={m.total}
                      on={on}
                      delay={600}
                      badge={reached ? tree.quotaReached : undefined}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <figcaption className={`mt-5 text-[13px] ${onBand ? "text-(--l-band-ink-2)" : "text-(--l-ink-2)"}`}>{tree.sample}</figcaption>
    </figure>
  );
}
