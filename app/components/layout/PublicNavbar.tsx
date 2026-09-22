"use client";
import { useState } from "react";
import Link from "next/link";
import { FEATURES } from "@/app/config/features";

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-white/5 px-4 py-4 sm:px-6 lg:px-12">
      <div className="flex items-center gap-2">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
        >
          <img
            src="/images/logo-1.png"
            alt="Ai Cave Logo"
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Navigation Links and CTA */}
      <div className="flex items-center gap-4 sm:gap-8">
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/home"
            className="text-white hover:text-gray-300 font-medium text-[15px] transition-colors"
          >
            Home
          </Link>
          <Link
            href="/features"
            className="text-white hover:text-gray-300 font-medium text-[15px] transition-colors"
          >
            Features
          </Link>
          {FEATURES.billing && (
            <Link
              href="/pricing"
              className="text-white hover:text-gray-300 font-medium text-[15px] transition-colors"
            >
              Pricing
            </Link>
          )}
          <Link
            href="/login"
            className="text-white hover:text-gray-300 font-medium text-[15px] transition-colors"
          >
            Login
          </Link>
        </div>

        <a
          href="/contact-sale"
          className="bg-[#6b7cff] hover:bg-[#5a6bed] text-white text-[15px] font-medium px-8 py-2.5 rounded-full transition-colors hidden md:block"
          style={{ letterSpacing: "-0.01em" }}
        >
          Contact Sales
        </a>

        <button
          type="button"
          className="text-2xl text-white md:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      <div
        className={`fixed inset-0 z-40 flex h-screen w-full flex-col items-center justify-center gap-8 bg-black/90 px-6 text-lg text-white backdrop-blur-xl transition-all duration-300 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <Link href="/home" onClick={() => setOpen(false)}>
          Home
        </Link>
        <Link href="/features" onClick={() => setOpen(false)}>
          Features
        </Link>
        {FEATURES.billing && (
          <Link href="/pricing" onClick={() => setOpen(false)}>
            Pricing
          </Link>
        )}
        <Link href="/login" onClick={() => setOpen(false)}>
          Login
        </Link>
        <Link
          href="/contact-sale"
          onClick={() => setOpen(false)}
          className="mt-4 rounded-full bg-[#6b7cff] px-6 py-3"
        >
          Contact Sales
        </Link>
      </div>
    </nav>
  );
}
