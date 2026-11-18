"use client";

import React from "react";

export default function ContactUs() {
  return (
    <section className="landing-container pb-24">
      <div className="grid items-center gap-8 rounded-3xl border border-(--l-line) bg-(--l-surface) p-6 md:grid-cols-[auto_1fr_auto] md:gap-10 md:p-10">
        <img
          src="/images/pricing-page/img1.png"
          alt="Creative Tools"
          className="hidden h-[220px] w-[180px] rounded-2xl object-cover md:block"
        />
        <div className="text-center md:text-left">
          <h2 className="text-[32px] font-semibold leading-tight tracking-[-0.02em] text-(--l-ink) md:text-[40px]">Galaxy Plan</h2>
          <p className="mt-3 text-lg text-(--l-ink-2)">Custom plan for enterprise</p>
          <a
            href="/contact-sale"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-(--l-primary) px-8 py-3 text-base font-semibold text-(--l-primary-ink) transition-opacity hover:opacity-90"
          >
            Contact Us
          </a>
        </div>
        <img
          src="/images/pricing-page/img2.png"
          alt="Ai Generation"
          className="mx-auto h-[200px] w-[200px] rounded-2xl object-cover md:h-[220px] md:w-[220px]"
        />
      </div>
    </section>
  );
}
