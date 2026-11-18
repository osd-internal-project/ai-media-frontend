"use client";
import { useState, type ReactNode } from "react";
import { useCopy } from "../i18n/LocaleProvider";
import { landingMedia } from "../media";
import { DemoButton, SecondaryLink } from "./sections/Actions";
import WorkflowMorph from "./motion/WorkflowMorph";
import CreditTree from "./motion/CreditTree";
import DualPlayer from "./motion/DualPlayer";
import VoiceWave from "./motion/VoiceWave";
import { ProblemSolution } from "./sections/Story";
import { SecurityFaq } from "./sections/Trust";

/** Keeps each space-separated phrase on one line when it fits, so Thai headings never break mid-phrase. */
export function Phrases({ text }: { text: string }) {
  const parts = text.split(" ");
  if (parts.length < 2) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) => (
        <span key={i} className="inline-block">
          {p}
          {i < parts.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

export function BandHeading({ title, body, onBand = false }: { title: string; body?: string; onBand?: boolean }) {
  return (
    <div className="max-w-[680px]">
      <h2 className={`text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] md:text-[36px] ${onBand ? "text-(--l-band-ink)" : "text-(--l-ink)"}`}>
        <Phrases text={title} />
      </h2>
      {body && <p className={`mt-3 max-w-[62ch] text-[17px] leading-relaxed ${onBand ? "text-(--l-band-ink-2)" : "text-(--l-ink-2)"}`}>{body}</p>}
    </div>
  );
}

/** A showcase tile: the media sits in its own frame and the words sit under it, never on top of the picture. */
export function MediaTile({
  src,
  media,
  title,
  caption,
  body,
  className = "",
  frameClass = "h-[200px]",
}: {
  src?: string;
  media?: ReactNode;
  title: string;
  caption: string;
  body: string;
  className?: string;
  frameClass?: string;
}) {
  return (
    <figure className={`flex flex-col ${className}`}>
      <div className={`relative overflow-hidden rounded-[20px] bg-(--l-raised) ${frameClass}`}>
        {media ??
          (src &&
            (src.endsWith(".mp4") ? (
              <video src={src} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <img src={src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            )))}
      </div>
      <figcaption className="mt-4">
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[20px] font-semibold text-(--l-ink)">{title}</span>
          <span className="text-sm text-(--l-ink-2)">{caption}</span>
        </span>
        <span className="mt-1.5 block max-w-[48ch] text-[15px] leading-relaxed text-(--l-ink-2)">{body}</span>
      </figcaption>
    </figure>
  );
}

function CreateBand() {
  const { t } = useCopy();
  const c = t.create;
  return (
    <section id="create" className="landing-container py-16 md:py-20">
      <BandHeading title={c.headline} body={c.body} />
      <div className="mt-10 grid gap-x-5 gap-y-10 md:grid-cols-6">
        <MediaTile className="md:col-span-4" frameClass="h-[220px] md:h-[300px]" src={landingMedia.create.image} {...c.image} />
        <MediaTile className="md:col-span-2" frameClass="h-[220px] md:h-[300px]" src={landingMedia.create.video} {...c.video} />
        <MediaTile className="md:col-span-2" src={landingMedia.create.avatar} {...c.avatar} />
        <MediaTile
          className="md:col-span-2"
          frameClass="h-[200px] p-1.5"
          media={
            <DualPlayer
              source={landingMedia.motion.source}
              result={landingMedia.motion.result}
              sourceLabel={c.motion.source}
              resultLabel={c.motion.result}
              pendingLabel={c.motion.pending}
            />
          }
          title={c.motion.title}
          caption={c.motion.caption}
          body={c.motion.body}
        />
        <MediaTile
          className="md:col-span-2"
          frameClass="h-[200px] flex items-center border border-(--l-line) bg-(--l-surface) px-6"
          media={<VoiceWave src={landingMedia.voice.audio} playLabel={c.voice.play} pauseLabel={c.voice.pause} pendingLabel={c.voice.pending} />}
          title={c.voice.title}
          caption={c.voice.caption}
          body={c.voice.body}
        />
      </div>
    </section>
  );
}

function WorkflowBand() {
  const { t } = useCopy();
  return (
    <section className="border-y border-(--l-line) bg-(--l-surface)">
      <div className="landing-container py-16 md:py-20">
        <BandHeading title={t.workflow.headline} body={t.workflow.body} />
        <div className="mt-10">
          <WorkflowMorph />
        </div>
      </div>
    </section>
  );
}

export function BrandKitPanel() {
  const { t } = useCopy();
  const kit = t.control.brandKit;
  const [active, setActive] = useState(kit.tabs[0].id);
  const tab = kit.tabs.find((x) => x.id === active) ?? kit.tabs[0];
  return (
    <div className="rounded-[14px] bg-(--l-surface) p-5 text-(--l-ink) shadow-[0_24px_48px_-24px_rgba(0,0,0,0.45)]">
      <p className="font-semibold">{kit.title}</p>
      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label={kit.tabsLabel}>
        {kit.tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={x.id === active}
            onClick={() => setActive(x.id)}
            className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
              x.id === active ? "bg-(--l-primary) text-(--l-primary-ink)" : "bg-(--l-raised) text-(--l-ink-2) hover:text-(--l-ink)"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>
      <p role="tabpanel" className="mt-4 min-h-[3.5rem] text-[15px] leading-relaxed text-(--l-ink-2)">
        {tab.body}
      </p>
    </div>
  );
}

function ControlBand() {
  const { t } = useCopy();
  return (
    <section className="bg-(--l-band)">
      <div className="landing-container grid items-center gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <BandHeading onBand title={t.control.headline} body={t.control.body} />
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <CreditTree onBand />
        </div>
      </div>
    </section>
  );
}

export function FinalCta({ headline }: { headline?: string }) {
  const { t } = useCopy();
  return (
    <section id="contact" className="landing-container py-16 md:py-20">
      <div className="grid gap-8 border-t border-(--l-line) pt-12 md:grid-cols-12">
        <h2 className="text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-(--l-ink) md:col-span-7 md:text-[40px]">
          <Phrases text={headline ?? t.finalCta.headline} />
        </h2>
        <div className="md:col-span-5">
          <p className="text-[17px] leading-relaxed text-(--l-ink-2)">{t.finalCta.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <DemoButton />
            <SecondaryLink href="/signup">{t.actions.startFree}</SecondaryLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomeBands() {
  return (
    <>
      <ProblemSolution />
      <CreateBand />
      <WorkflowBand />
      <ControlBand />
      <SecurityFaq />
      <FinalCta />
    </>
  );
}
