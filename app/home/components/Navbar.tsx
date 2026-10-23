"use client";
import Link from "next/link";
import { useState } from "react";
import { FEATURES } from "@/app/config/features";
import AnnouncementModal from "./AnnouncementModal";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 lg:px-12 py-4 border-b border-white/5">
      
      {/* LOGO */}
      <Link href="/" className="flex items-center gap-2">
        <img src="/images/logo-1.png" alt="Ai Cave Logo" className="h-8" />
      </Link>

      {/* DESKTOP MENU */}
      <div className="hidden md:flex items-center gap-8">
        <Link href="/home" className="nav-link">Home</Link>
        <Link href="/features" className="nav-link">Features</Link>
        {FEATURES.billing && <Link href="/pricing" className="nav-link">Pricing</Link>}
        <a href="/login" className="nav-link">Login</a>

        <a
          href="/contact-sale"
          className="bg-[#6b7cff] hover:bg-[#5a6bed] text-white text-[15px] font-medium px-6 py-2.5 rounded-full transition"
        >
          Contact Sales
        </a>
      </div>

      {/* MOBILE BUTTON */}
      <button
        className="md:hidden text-white text-2xl"
        onClick={() => setOpen(!open)}
      >
        {open ? "✕" : "☰"}
      </button>

      {/* MOBILE MENU */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center gap-8 text-white text-lg transition-all duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <Link href="/home" onClick={() => setOpen(false)}>Home</Link>
        <Link href="/features" onClick={() => setOpen(false)}>Features</Link>
        {FEATURES.billing && <Link href="/pricing" onClick={() => setOpen(false)}>Pricing</Link>}
        <a href="/login" onClick={() => setOpen(false)}>Login</a>

        <a
          href="/contact-sale"
          onClick={() => setOpen(false)}
          className="bg-[#6b7cff] px-6 py-3 rounded-full mt-4"
        >
          Contact Sales
        </a>
      </div>

      {/* ประกาศ — Navbar นี้ใช้ร่วมกันใน home/features/pricing */}
      <AnnouncementModal />

      {/* STYLE */}
      <style jsx>{`
        .nav-link {
          color: white;
          font-size: 15px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: #d1d5db;
        }
      `}</style>
    </nav>
  );
}