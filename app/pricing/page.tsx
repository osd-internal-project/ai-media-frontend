"use client";
import React from "react";
import Navbar from "@/app/home/components/Navbar";
import AnnouncementModal from "@/app/home/components/AnnouncementModal";
import LandingShell from "@/app/home/components/LandingShell";
import BillingGate from "@/app/components/BillingGate";
import dynamic from "next/dynamic";

const Plan = dynamic(() => import("./components/Plan"), {
  ssr: false,
  loading: () => (
    <div className="px-4 pb-10 pt-24 sm:pt-28 md:pt-32">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="mb-4 h-10 w-48 rounded-full bg-(--l-raised) sm:mb-6 sm:h-12 sm:w-64" />
        <div className="mb-10 h-5 w-60 rounded-full bg-(--l-surface) sm:mb-14 sm:h-6 sm:w-80" />
        <div className="mb-8 flex justify-center md:mb-10">
          <div className="h-10 w-44 rounded-full bg-(--l-raised) sm:w-56" />
        </div>
        <div className="flex gap-4 overflow-hidden md:grid md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[540px] min-w-[240px] flex-1 rounded-[28px] bg-(--l-surface) sm:h-[620px] sm:min-w-[280px]"
            />
          ))}
        </div>
      </div>
    </div>
  ),
});

const ContactUs = dynamic(() => import("./components/ContactUs"), {
  ssr: false,
  loading: () => (
    <div className="px-4 py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-5xl animate-pulse rounded-[32px] bg-(--l-surface) px-5 py-10 sm:rounded-[40px] sm:px-6 sm:py-12">
        <div className="mx-auto mb-5 h-10 w-44 rounded-full bg-(--l-raised) sm:mb-6 sm:h-12 sm:w-56" />
        <div className="mx-auto h-5 w-56 rounded-full bg-(--l-surface) sm:h-6 sm:w-72" />
      </div>
    </div>
  ),
});

export default function PricingPage() {
  return (
    <BillingGate>
    <LandingShell>
      <div className="relative z-10 flex flex-col">
        <Navbar />
        <AnnouncementModal />
        <Plan />
        <ContactUs />
      </div>
    </LandingShell>
    </BillingGate>
  );
}
