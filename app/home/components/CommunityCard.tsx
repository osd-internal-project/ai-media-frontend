"use client";
import { useCopy } from "../i18n/LocaleProvider";
import { landingMedia } from "../media";
import { CommunityLink } from "./sections/Actions";

/** Teaser for the separate AI Cave Community site. */
export default function CommunityCard() {
  const { t } = useCopy();
  const card = t.community.card;
  return (
    <aside
      aria-labelledby="community-title"
      className="overflow-hidden rounded-2xl border border-[rgba(124,92,230,0.35)] bg-(--l-band) text-(--l-band-ink) shadow-[0_18px_40px_-14px_rgba(111,106,222,0.65)]"
    >
      <div className="grid grid-cols-3 gap-1 p-1" aria-hidden>
        {landingMedia.community.map((src) => (
          <img key={src} src={src} alt="" className="aspect-square w-full rounded-xl object-cover" />
        ))}
      </div>
      <div className="p-5 pt-4">
        <h2 id="community-title" className="text-lg font-semibold">
          {card.title}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-(--l-band-ink-2)">
          {card.body}
        </p>
        <CommunityLink label={card.visit} size="sm" className="mt-4 w-full" />
      </div>
    </aside>
  );
}
