import { UsersRound } from "lucide-react";
import config from "@/app/config";
import "./community-pill.css";

type CommunityPillProps = {
  label: string;
  newTabLabel: string;
  size?: "xs" | "sm" | "md";
  /** Gradient hairline only, for the signed-in header where it is an ad beside work tools. */
  quiet?: boolean;
  className?: string;
  onClick?: () => void;
};

// Heights (1px border included) match the neighbour: xs = Change Package 32px, sm = nav Demo 37px, md = DemoButton.
const sizes = {
  xs: { box: "h-8 gap-1 px-3 text-[13px]", icon: 14 },
  sm: { box: "gap-1.5 px-[18px] py-[9px] text-[15px]", icon: 15 },
  md: { box: "gap-1.5 px-[26px] py-[13px] text-base", icon: 17 },
};

/** Indigo→pink gradient link to the separate Community site, shared by public pages and the signed-in header. New tab: it has its own login. */
export default function CommunityPill({ label, newTabLabel, size = "md", quiet = false, className = "", onClick }: CommunityPillProps) {
  const s = sizes[size];
  return (
    <a
      href={config.communityUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`community-pill ${quiet ? "community-pill--quiet " : ""}inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full font-semibold ${s.box} ${className}`}
    >
      {/* Heavier than lucide's default 2 so the line icon holds up on the gradient. */}
      <UsersRound size={s.icon} strokeWidth={2.25} aria-hidden />
      {label}
      <span className="sr-only">{newTabLabel}</span>
    </a>
  );
}
