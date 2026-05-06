"use client";
import React from "react";
import Navbar from "@/app/home/components/Navbar";
import dynamic from "next/dynamic";

const Plan = dynamic(() => import("./components/Plan"), {
  ssr: false,
  loading: () => (
    <div className="px-4 pb-10 pt-24 sm:pt-28 md:pt-32">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="mb-4 h-10 w-48 rounded-full bg-white/10 sm:mb-6 sm:h-12 sm:w-64" />
        <div className="mb-10 h-5 w-60 rounded-full bg-white/5 sm:mb-14 sm:h-6 sm:w-80" />
        <div className="mb-8 flex justify-center md:mb-10">
          <div className="h-10 w-44 rounded-full bg-white/10 sm:w-56" />
        </div>
        <div className="flex gap-4 overflow-hidden md:grid md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[540px] min-w-[240px] flex-1 rounded-[28px] bg-white/5 sm:h-[620px] sm:min-w-[280px]"
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
      <div className="mx-auto max-w-5xl animate-pulse rounded-[32px] bg-white/5 px-5 py-10 sm:rounded-[40px] sm:px-6 sm:py-12">
        <div className="mx-auto mb-5 h-10 w-44 rounded-full bg-white/10 sm:mb-6 sm:h-12 sm:w-56" />
        <div className="mx-auto h-5 w-56 rounded-full bg-white/5 sm:h-6 sm:w-72" />
      </div>
    </div>
  ),
});

export default function PricingPage() {
  return (
    <main
      className="relative min-h-screen overflow-x-hidden bg-[#020308] text-white"
      style={{ fontFamily: "Clash Display Variable" }}
    >
      {/* Ambient Background Glows */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {/* Deep blue/purple center glow */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "40%",
            width: "120vw",
            height: "120vh",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(20, 24, 60, 0.4) 0%, rgba(2, 3, 8, 0) 60%)",
            filter: "blur(72px)",
          }}
        />

        {/* Soft lighter blue right edge glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "-30%",
            width: "80vw",
            height: "100vh",
            transform: "translateY(-50%)",
            background:
              "radial-gradient(circle, rgba(30, 45, 80, 0.25) 0%, rgba(2, 3, 8, 0) 60%)",
            filter: "blur(84px)",
          }}
        />
      </div>

      {/* Content wrapper with z-index to sit above the fixed background */}
      <div className="relative z-10 flex flex-col">
        <Navbar />
        <Plan />
        <ContactUs />
      </div>
    </main>
  );
}
