"use client";
import React from "react";
import CompanyProfile from "./components/CompanyProfile";
import ContactForm from "./components/ContactForm";
import PublicNavbar from "../components/layout/PublicNavbar";
import { message } from "antd";

export default function PricingPage() {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <main
      className="relative overflow-x-hidden bg-[#020308] text-white"
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
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {contextHolder}
        <PublicNavbar />
        <ContactForm messageApi={messageApi} />
        <CompanyProfile />
        {/* <Footer /> */}
      </div>
    </main>
  );
}
