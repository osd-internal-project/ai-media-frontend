"use client";
import Link from "next/link";
import CommunityCard from "./CommunityCard";
import PromptDemo from "./PromptDemo";
import GradientText from "./motion/GradientText";
import { DemoButton, SecondaryLink } from "./sections/Actions";
import { useCopy } from "../i18n/LocaleProvider";

export default function LandingHero() {
  const { t } = useCopy();
  return (
    <section className="landing-container pb-14 pt-10 md:pb-16 md:pt-14">
      <div className="grid gap-8 md:grid-cols-12 md:gap-x-8 md:gap-y-5">
        <div className="md:col-span-6 md:row-span-2 md:pt-10">
          <h1 className="text-balance text-[36px] font-semibold leading-[1.08] tracking-[-0.03em] md:text-[52px]">
            <GradientText sweep>{t.hero.headline}</GradientText>
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-(--l-ink-2)">{t.hero.sub}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <DemoButton />
            <SecondaryLink href="/signup">{t.actions.startFree}</SecondaryLink>
          </div>
          <Link href="/features" className="mt-5 inline-block text-[15px] font-medium text-(--l-ink) underline decoration-(--l-line) underline-offset-[6px] hover:decoration-(--l-accent)">
            {t.actions.seeFeatures}
          </Link>
        </div>

        <div className="md:col-span-6 md:col-start-7 md:row-start-1 md:ml-auto md:w-85">
          <CommunityCard />
        </div>

        <div className="md:col-span-6 md:col-start-7 md:row-start-2 md:pl-6 lg:pl-12">
          <PromptDemo />
        </div>
      </div>

    </section>
  );
}
