"use client";
import { useState } from "react";
import { BandHeading, BrandKitPanel, FinalCta, Phrases } from "@/app/home/components/HomeBands";
import { HowItWorks } from "@/app/home/components/sections/Story";
import { DemoButton } from "@/app/home/components/sections/Actions";
import DualPlayer from "@/app/home/components/motion/DualPlayer";
import VoiceWave from "@/app/home/components/motion/VoiceWave";
import { useCopy } from "@/app/home/i18n/LocaleProvider";
import { landingMedia } from "@/app/home/media";

type GroupKey = "create" | "control" | "community" | "useCases";
const groupIds: { id: string; key: GroupKey }[] = [
  { id: "create", key: "create" },
  { id: "control", key: "control" },
  { id: "community", key: "community" },
  { id: "use-cases", key: "useCases" },
];

function FeaturesHero() {
  const { t } = useCopy();
  return (
    <section className="landing-container pb-10 pt-12 md:pt-16">
      <h1 className="max-w-[18ch] text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-(--l-ink) md:text-[46px]">
        <Phrases text={t.features.headline} />
      </h1>
      <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-(--l-ink-2)">{t.features.body}</p>
    </section>
  );
}

function GroupNav() {
  const { t } = useCopy();
  return (
    <nav aria-label={t.features.groupsLabel} className="l-groupnav sticky top-16 z-40 border-y border-(--l-line) bg-[color-mix(in_srgb,var(--l-bg)_90%,transparent)] backdrop-blur-md">
      <div className="landing-container flex gap-2 overflow-x-auto py-3">
        {groupIds.map((g) => (
          <a
            key={g.id}
            href={`#${g.id}`}
            className="shrink-0 rounded-full bg-(--l-raised) px-4 py-2 text-sm font-medium text-(--l-ink-2) transition-colors duration-200 hover:bg-(--l-primary) hover:text-(--l-primary-ink)"
          >
            {t.features.groups[g.key]}
          </a>
        ))}
      </div>
    </nav>
  );
}

type ModeId = "image" | "video" | "avatar" | "motion" | "voice";
const modeIds: ModeId[] = ["image", "video", "avatar", "motion", "voice"];

function ModeMedia({ id }: { id: ModeId }) {
  const { t } = useCopy();
  if (id === "motion") {
    return (
      <div className="h-full p-2">
        <DualPlayer
          source={landingMedia.motion.source}
          result={landingMedia.motion.result}
          sourceLabel={t.create.motion.source}
          resultLabel={t.create.motion.result}
          pendingLabel={t.create.motion.pending}
        />
      </div>
    );
  }
  if (id === "voice") {
    return (
      <div className="flex h-full items-center px-8">
        <VoiceWave src={landingMedia.voice.audio} playLabel={t.create.voice.play} pauseLabel={t.create.voice.pause} pendingLabel={t.create.voice.pending} />
      </div>
    );
  }
  const src = landingMedia.create[id];
  return src.endsWith(".mp4") ? (
    <video key={src} src={src} autoPlay muted loop playsInline className="h-full w-full object-cover" />
  ) : (
    <img key={src} src={src} alt="" className="h-full w-full object-cover" />
  );
}

function CreateGroup() {
  const { t } = useCopy();
  const [active, setActive] = useState<ModeId>("image");
  const mode = t.features.modes[active];
  return (
    <section id="create" className="landing-container py-16 md:py-20">
      <BandHeading title={t.features.createHeadline} body={t.features.creditNote} />
      <div className="mt-8 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={t.features.modesLabel}>
        {modeIds.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={id === active}
            aria-controls="mode-panel"
            onClick={() => setActive(id)}
            className={`shrink-0 rounded-full px-5 py-2.5 text-[15px] font-medium transition-colors duration-200 ${
              id === active ? "bg-(--l-primary) text-(--l-primary-ink)" : "bg-(--l-raised) text-(--l-ink-2) hover:text-(--l-ink)"
            }`}
          >
            {t.features.modes[id].label}
          </button>
        ))}
      </div>
      <div id="mode-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="mt-6 grid overflow-hidden rounded-[20px] border border-(--l-line) bg-(--l-surface) md:grid-cols-12">
        <div className="aspect-[4/3] bg-(--l-raised) md:col-span-7 md:aspect-auto md:min-h-[360px]">
          <ModeMedia id={active} />
        </div>
        <dl className="flex flex-col justify-center gap-6 p-6 md:col-span-5 md:p-10">
          <div>
            <dt className="text-sm text-(--l-ink-2)">{t.features.youGive}</dt>
            <dd className="mt-1 text-xl font-semibold text-(--l-ink)">{mode.input}</dd>
          </div>
          <div>
            <dt className="text-sm text-(--l-ink-2)">{t.features.youGet}</dt>
            <dd className="mt-1 text-xl font-semibold text-(--l-ink)">{mode.output}</dd>
          </div>
          <p className="border-t border-(--l-line) pt-5 text-[15px] leading-relaxed text-(--l-ink-2)">{t.create[active].body}</p>
        </dl>
      </div>

      <h3 className="mt-16 text-[22px] font-semibold text-(--l-ink)">{t.features.toolsHeadline}</h3>
      <ul className="mt-6 grid gap-8 md:grid-cols-3">
        {t.workflow.tools.map((tool) => (
          <li key={tool.title} className="border-t border-(--l-line) pt-5">
            <h4 className="text-lg font-semibold text-(--l-ink)">{tool.title}</h4>
            <p className="mt-1.5 text-[15px] leading-relaxed text-(--l-ink-2)">{tool.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ControlGroup() {
  const { t } = useCopy();
  return (
    <section id="control" className="bg-(--l-band)">
      <div className="landing-container grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <BandHeading onBand title={t.features.controlHeadline} body={t.features.controlBody} />
          <div className="mt-8">
            <BrandKitPanel />
          </div>
          <img src={landingMedia.photoEvent} alt="" loading="lazy" className="mt-8 aspect-[16/10] w-full rounded-[20px] object-cover" />
        </div>
        <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 md:col-span-7">
          {t.control.items.map((item) => (
            <li key={item.title} className="border-t border-white/25 pt-5">
              <h3 className="text-lg font-semibold text-(--l-band-ink)">{item.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-(--l-band-ink-2)">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CommunityGroup() {
  const { t } = useCopy();
  const c = t.community;
  return (
    <section id="community" className="landing-container py-16 md:py-20">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-6">
          <BandHeading title={c.headline} />
          <span className="mt-4 inline-block rounded-full bg-[#0FEAB6] px-3 py-1 text-[13px] font-semibold text-[#191C20]">{c.comingSoon}</span>
          <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-(--l-ink-2)">{c.body}</p>
          <div className="mt-8">
            <DemoButton topic="community" />
          </div>
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <div className="grid grid-cols-3 gap-2" aria-hidden>
            {landingMedia.community.map((src) => (
              <img key={src} src={src} alt="" loading="lazy" className="aspect-[3/4] w-full rounded-[14px] object-cover" />
            ))}
          </div>
          <dl className="mt-8 space-y-6">
            {[c.forOrgs, c.forCreators].map((side) => (
              <div key={side.title} className="border-t border-(--l-line) pt-5">
                <dt className="text-lg font-semibold text-(--l-ink)">{side.title}</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-(--l-ink-2)">{side.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function UseCasesGroup() {
  const { t } = useCopy();
  return (
    <section id="use-cases" className="border-y border-(--l-line) bg-(--l-surface)">
      <div className="landing-container py-16 md:py-20">
        <BandHeading title={t.useCases.headline} />
        <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {t.useCases.items.map((u) => (
            <li key={u.title} className="border-t border-(--l-line) pt-5">
              <h3 className="text-lg font-semibold text-(--l-ink)">{u.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-(--l-ink-2)">{u.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function FeaturesView() {
  const { t } = useCopy();
  return (
    <>
      <FeaturesHero />
      <GroupNav />
      <CreateGroup />
      <ControlGroup />
      <HowItWorks />
      <CommunityGroup />
      <UseCasesGroup />
      <FinalCta headline={t.features.ctaHeadline} />
    </>
  );
}
