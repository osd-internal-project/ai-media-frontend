"use client";
import { Button } from "antd";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4 border-white/5">
      <div className="flex items-center gap-2">
        {/* Logo */}
        <Link
          href="/"
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
      <div className="flex items-center gap-8">
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
          <Link
            href="/login"
            className="text-white hover:text-gray-300 font-medium text-[15px] transition-colors"
          >
            Login
          </Link>
        </div>

        <button
          className="bg-[#6b7cff] hover:bg-[#5a6bed] text-white text-[15px] font-medium px-8 py-2.5 rounded-full transition-colors hidden md:block"
          style={{ letterSpacing: "-0.01em" }}
        >
          Contact Sales
        </button>
      </div>
    </nav>
  );
}
