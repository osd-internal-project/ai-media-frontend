"use client";

import React from "react";
import { Image } from "antd";

export default function ContactUs() {
  return (
    <div
      className="relative w-full overflow-hidden bg-[linear-gradient(to_bottom,#080c17_40%,rgba(31,27,62,0.4)_100%)] px-4 pb-14 pt-6 sm:px-5 sm:pb-16"
    >
      {/* Background radial gradient glow */}
      <div
        className="pointer-events-none absolute left-0 top-[90%] z-0 h-[220px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-[30%] opacity-60 blur-[48px] sm:h-[320px] sm:w-[620px] sm:blur-[64px]"
        style={{
          background: `
      radial-gradient(circle at 40% 50%, rgba(120,110,255,0.45) 0%, rgba(120,110,255,0.25) 30%, rgba(120,110,255,0.1) 55%, rgba(0,0,0,0) 70%),
      radial-gradient(circle at 70% 50%, rgba(120,180,255,0.35) 0%, rgba(120,180,255,0.15) 35%, rgba(0,0,0,0) 65%)
    `,
        }}
      />

      {/* Galaxy Plan */}

      {/* Bottom Images & Contacts Section matching reference */}
      <div className="relative mx-auto mt-14 max-w-6xl px-0 sm:mt-20 sm:px-4 md:mt-24">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-8 lg:gap-12">
          {/* Left Image Box */}
          <div className="relative order-1 flex w-full justify-center pt-4 pr-4 sm:pt-6 sm:pr-6 md:justify-start">
            {/* Dot Grid Background */}
            <div
              className="pointer-events-none absolute right-0 top-0 h-24 w-24 opacity-40 sm:h-40 sm:w-40"
              style={{
                backgroundImage: "radial-gradient(#888 3px, transparent 3px)",
                backgroundSize: "20px 20px",
              }}
            ></div>
            <Image
              src="/images/pricing-page/img1.png"
              alt="Creative Tools"
              preview={false}
              className="relative z-10 h-[240px] w-[210px] rounded-[28px] border-4 border-white object-cover shadow-2xl sm:h-[320px] sm:w-[260px] sm:rounded-[40px] sm:border-8"
            />
          </div>

          {/* Center Contact Us */}
          <div className="order-3 z-20 space-y-6 px-2 pb-2 text-center sm:space-y-8 md:order-2 md:max-w-[320px] lg:max-w-none">
            <div className="space-y-4 sm:space-y-5">
              <div className="text-3xl font-medium leading-none tracking-tight sm:text-[50px]">
                Galaxy Plan
              </div>
              <div className="mx-auto max-w-xs text-sm leading-6 text-white/75 sm:text-lg sm:leading-[139%]">
                Custom plan for enterprise
              </div>
            </div>
            <a
              href="/contact-sale"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#353535] px-8 py-3 text-base font-medium text-white shadow-xl transition-colors hover:bg-black sm:w-auto sm:px-10 sm:text-lg"
            >
              Contact Us
            </a>
          </div>

          {/* Right Image Box */}
          <div className="relative order-2 flex w-full justify-center pl-4 pb-4 sm:pl-6 sm:pb-6 md:order-3 md:justify-end">
            {/* Gray Circle Background */}
            {/* <div className="absolute bottom-0 right-[-20px] w-48 h-48 bg-[#E5E5E5] rounded-full z-0 pointer-events-none"></div> */}
            <Image
              src="/images/pricing-page/img2.png"
              alt="Ai Generation"
              preview={false}
              className="relative z-10 h-[220px] w-[220px] rounded-[28px] border-4 border-white object-cover shadow-2xl sm:h-[260px] sm:w-[260px] sm:rounded-[40px] sm:border-8"
            />
          </div>
        </div>{" "}
        {/* Bottom Form Actions */}
        {/* <div className="flex flex-wrap justify-center items-center gap-6 mt-32 pb-12">
                <button className="px-12 py-3 rounded-full border-2 border-[#6966FF] text-[#6966FF] font-medium text-[17px] hover:bg-indigo-50 transition-colors">
                  Book a Demo
                </button>
                <button className="px-12 py-3 rounded-full bg-[#6966FF] text-white font-medium text-[17px] hover:bg-[#5A55CC] transition-colors shadow-lg">
                  Contact Sales
                </button>
              </div> */}
      </div>
    </div>
  );
}
