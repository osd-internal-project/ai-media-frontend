"use client";
import { useCopy } from "../i18n/LocaleProvider";
import { landingMedia } from "../media";

/** Teaser for the separate AI Cave Community site; the button stays disabled until that site has a link. */
export default function CommunityCard() {
  const { t } = useCopy();
  const card = t.community.card;
  return (
    <aside
      aria-labelledby="community-title"
      className="overflow-hidden rounded-2xl border border-[#0FEAB6] bg-(--l-band) text-(--l-band-ink) shadow-[0_18px_40px_-14px_rgba(111,106,222,0.65)]"
    >
      <div className="grid grid-cols-3 gap-1 p-1" aria-hidden>
        {landingMedia.community.map((src) => (
          <img key={src} src={src} alt="" className="aspect-square w-full rounded-xl object-cover" />
        ))}
      </div>
      <div className="p-5 pt-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="community-title" className="text-lg font-semibold">
            {card.title}
          </h2>
          <span className="shrink-0 rounded-full bg-[#0FEAB6] px-2.5 py-1 text-xs font-semibold text-[#191C20]">{t.community.comingSoon}</span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-(--l-band-ink-2)">
          {card.body}
        </p>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="mt-4 w-full cursor-not-allowed rounded-full bg-white/15 px-4 py-2.5 text-sm font-semibold text-white/85"
        >
          {card.visit}
        </button>
      </div>
    </aside>
  );
}
