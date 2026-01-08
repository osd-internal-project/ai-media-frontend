"use client";
import React, { useEffect, useState, useRef } from "react";
import { Button, Image } from "antd";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

const PricingPage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">(
    "monthly"
  );
  const pricingRef = useRef<HTMLDivElement | null>(null);
  const featureRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = () => {
    router.push("/login");
  };

  const plans = [
    {
      name: "Essential",
      price: { monthly: 14, annually: 11 },
      popular: false,
      description: "Start experimenting with the magic of AI creation.",
      badge: null,
      borderColor: "border-blue-500",
      features: [
        { icon: "💳", text: "4,000 credits / month" },
        { icon: "🖼️", text: "~Up to 4,000 images" },
        { icon: "🎬", text: "~Up to 50 videos" },
        { icon: "👤", text: "~13 consistent characters" },
        { icon: "🤖", text: "~13 personalized models" },
        { icon: "📖", text: "~Up to 5 One-Click Stories" },
        { icon: "⚡", text: "~8 parallel generations" },
        {
          icon: "🎨",
          text: "Access to 100+ premium image, video and audio models",
        },
        { icon: "📝", text: "One-Click Story Creation" },
      ],
    },
    {
      name: "Advanced",
      price: { monthly: 29, annually: 23 },
      popular: false,
      description: "Unlock deeper control and create at scale.",
      badge: null,
      borderColor: "border-blue-600",
      features: [
        { icon: "💳", text: "12,000 credits / month" },
        { icon: "♾️", text: "Add credits as needed" },
        { icon: "🖼️", text: "~Up to 12,000 images" },
        { icon: "🎬", text: "~Up to 150 videos" },
        { icon: "👤", text: "~40 consistent characters" },
        { icon: "🤖", text: "~40 personalized models" },
        { icon: "📖", text: "~Up to 17 One-Click Stories" },
        { icon: "⚡", text: "~16 parallel generations" },
        {
          icon: "🎨",
          text: "Access to 100+ premium image, video and audio models",
        },
        { icon: "📝", text: "One-Click Story Creation" },
      ],
    },
    {
      name: "Infinite",
      price: { monthly: 56, annually: 45 },
      popular: true,
      description: "Create at full speed with uninterrupted flow.",
      badge: "MOST POPULAR",
      borderColor: "border-pink-500",
      features: [
        { icon: "💳", text: "24,000 credits / month" },
        { icon: "♾️", text: "Add credits as needed" },
        { icon: "🖼️", text: "~Up to 24,000 images" },
        { icon: "🎬", text: "~Up to 300 videos" },
        { icon: "👤", text: "~80 consistent characters" },
        { icon: "🤖", text: "~80 personalized models" },
        { icon: "📖", text: "~Up to 34 One-Click Stories" },
        { icon: "⚡", text: "~32 parallel generations" },
        {
          icon: "🎨",
          text: "Access to 100+ premium image, video and audio models",
        },
        { icon: "📝", text: "One-Click Story Creation" },
      ],
    },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <nav className="relative bg-gray-800/50 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              <button
                type="button"
                className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500"
              >
                <span className="absolute -inset-0.5"></span>
                <span className="sr-only">Open main menu</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  data-slot="icon"
                  aria-hidden="true"
                  className="size-6 in-aria-expanded:hidden"
                >
                  <path
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  data-slot="icon"
                  aria-hidden="true"
                  className="size-6 not-in-aria-expanded:hidden"
                >
                  <path
                    d="M6 18 18 6M6 6l12 12"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex shrink-0 items-center">
                <Image
                  width="64px"
                  src="/images/Logo.png"
                  alt="OSD Logo"
                  preview={false}
                />
              </div>
              <div className="hidden sm:ml-6 sm:block">
                <div className="flex space-x-4">
                  <a
                    onClick={handleGetStarted}
                    className="cursor-pointer rounded-md bg-gray-950/50 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white transition"
                  >
                    Sign In
                  </a>

                  <a
                    onClick={() => {
                      pricingRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                  >
                    Package Price
                  </a>
                  <a
                    onClick={() => {
                      featureRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                  >
                    Features
                  </a>
                  <a
                    href="#"
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                  >
                    {/* Calendar */}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Content */}
      {/* What is AI Cave Section */}
      <div className="max-w-7xl mx-auto my-18 px-4">
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40">
          <div className="rounded-3xl bg-[#0B0B0C] px-12 py-12 md:px-16 md:py-14">
            {/* Subtitle */}
            <p className="text-sm uppercase tracking-widest text-purple-400 mb-4">
              What is AI Cave ?
            </p>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-8">
              Your All-in-One AI Media Creation Platform
            </h2>

            {/* Content */}
            <div className="space-y-6 text-gray-300 text-base md:text-lg leading-relaxed">
              <p>
                AI Cave is an all-in-one AI media creation platform that
                empowers creators to generate stunning images, videos, and audio
                in one seamless workspace. With access to premium AI models, you
                can create consistent characters, train personalized models, and
                bring ideas to life with just one click.
              </p>

              <p>
                Designed for speed and efficiency, AI Cave delivers high-quality
                results through parallel generation and professional-grade
                outputs.
              </p>

              <p className="text-gray-200">
                Whether you’re telling stories, building brands, or producing
                content at scale, AI Cave transforms imagination into reality —
                without complexity.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div ref={pricingRef} className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-gray-800 rounded-lg p-1 mb-6">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              MONTHLY
            </button>
            <button
              onClick={() => setBillingPeriod("annually")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === "annually"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              ANNUALLY
              <span className="ml-2 text-xs text-green-400">
                UP TO 50% OFF ⚡
              </span>
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 mb-8 max-w-4xl mx-auto">
            <p className="text-sm">
              Upgrade to Advanced or above from now till Jan 31 to enjoy
              discounted model prices throughout 2026
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-[#171717] rounded-lg overflow-hidden border-t-4 ${plan.borderColor} relative`}
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  {plan.badge && (
                    <span className="bg-pink-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">
                    $
                    {billingPeriod === "monthly"
                      ? plan.price.monthly
                      : plan.price.annually}
                  </span>
                  <span className="text-gray-400 text-sm">/Seat/mo</span>
                </div>
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-[#6c6c6c] hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4"
                >
                  Get Started
                </button>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {plan.description}
                </p>
              </div>

              {/* Features - Top Section */}
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  {/* Credits */}
                  <div className="flex items-center gap-3">
                    <span className="text-green-400">
                      {plan.features[0].icon}
                    </span>
                    <span className="text-green-400 font-medium">
                      {plan.features[0].text}
                    </span>
                  </div>

                  {/* Add credits if available */}
                  {plan.features[1]?.icon === "♾️" && (
                    <div className="flex items-center gap-3">
                      <span className="text-green-400">
                        {plan.features[1].icon}
                      </span>
                      <span className="text-green-400 font-medium">
                        {plan.features[1].text}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Features - Bottom Section */}
              <div className="bg-gray-750 px-6 py-6">
                <div className="space-y-3">
                  {plan.features
                    .slice(plan.features[1]?.icon === "♾️" ? 2 : 1)
                    .map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center gap-3"
                      >
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">
                          {feature.text}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Comparison Table */}
        <div ref={featureRef} className="max-w-6xl mx-auto mt-16 bg-[#0f0f0f] rounded-lg overflow-hidden border border-[#171717]">
          <div>
            <table className="w-full">
              {/* Plan Headers */}
              <thead>
                <tr>
                  <th className="w-1/4"></th>
                  <th className="text-center p-6 border-r border-[#171717]">
                    <div className="text-white">
                      <h3 className="text-2xl font-bold mb-4">Free Plan</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Elit eu odio interdum facilisis curabitur mauris
                        phasellus.
                      </p>
                    </div>
                  </th>
                  <th className="text-center p-6 border-r border-[#171717]">
                    <div className="text-white">
                      <h3 className="text-2xl font-bold mb-4">Lite Plan</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Elit eu odio interdum facilisis curabitur mauris
                        phasellus.
                      </p>
                    </div>
                  </th>
                  <th className="text-center p-6">
                    <div className="text-white">
                      <h3 className="text-2xl font-bold mb-4">Pro Plan</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Elit eu odio interdum facilisis curabitur mauris
                        phasellus.
                      </p>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* Plan Chapter Header */}
                <tr className="border-t border-[#171717]">
                  <td colSpan={4} className="p-4 bg-[#171717]">
                    <h4 className="text-gray-400 text-sm font-semibold tracking-wider uppercase">
                      PLAN CHAPTER
                    </h4>
                  </td>
                </tr>

                {/* Plan Features */}
                <tr className="border-t border-[#171717]">
                  <td className="p-4 text-white font-medium border-r border-[#171717]">
                    Plan feature
                  </td>
                  <td className="p-4 text-center border-r border-[#171717]">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </td>
                  <td className="p-4 text-center border-r border-[#171717]">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </td>
                </tr>

                <tr className="border-t border-[#171717]">
                  <td className="p-4 text-white font-medium border-r border-[#171717]">
                    Plan feature
                  </td>
                  <td className="p-4 text-center border-r border-[#171717]">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </td>
                  <td className="p-4 text-center border-r border-[#171717]">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </td>
                </tr>

                <tr className="border-t border-[#171717]">
                  <td className="p-4 text-white font-medium border-r border-[#171717]">
                    Plan feature
                  </td>
                  <td className="p-4 text-center border-r border-[#171717]">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </td>
                  <td className="p-4 text-center border-r border-[#171717]">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </td>
                </tr>

                <tr className="border-t border-[#171717]">
                  <td className="p-4 text-white font-medium border-r border-[#171717]">
                    Plan feature
                  </td>
                  <td className="p-4 text-center border-r border-[#171717]">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </td>
                  <td className="p-4 text-center border-r border-[#171717]">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </td>
                </tr>

                {/* Plan Chapter Header 2 */}
                <tr className="border-t border-[#171717]">
                  <td colSpan={4} className="p-4 bg-[#171717]">
                    <h4 className="text-gray-400 text-sm font-semibold tracking-wider uppercase">
                      PLAN CHAPTER
                    </h4>
                  </td>
                </tr>

                <tr className="border-t border-[#171717]">
                  <td className="p-4 text-white font-medium border-r border-[#171717]">
                    Plan feature
                  </td>
                  <td className="p-4 text-center border-r border-[#171717]">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </td>
                  <td className="p-4 text-center border-r border-[#171717]">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </td>
                </tr>

                <tr className="border-t border-[#171717]">
                  <td className="p-4 text-white font-medium border-r border-[#171717]">
                    Plan feature
                  </td>
                  <td className="p-4 text-center border-r border-[#171717]"></td>
                  <td className="p-4 text-center border-r border-[#171717]">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </td>
                </tr>

                <tr className="border-t border-[#171717]">
                  <td className="p-4 text-white font-medium border-r border-[#171717]">
                    Plan feature
                  </td>
                  <td className="p-4 text-center border-r border-[#171717]"></td>
                  <td className="p-4 text-center border-r border-[#171717]"></td>
                  <td className="p-4 text-center">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
