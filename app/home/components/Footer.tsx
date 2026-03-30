"use client";

import React, { useState, useEffect } from "react";

export default function Footer() {
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMd = windowWidth >= 768;

  return (
    <footer
      style={{
        width: "100%",
        backgroundColor: "#05070a", // Solid dark background matching the image
        paddingTop: "32px",
        paddingBottom: "64px",
        paddingLeft: "16px",
        paddingRight: "16px",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          marginLeft: "auto",
          marginRight: "auto",
          display: "grid",
          gridTemplateColumns: isMd ? "2fr 1fr 1fr" : "1fr",
          gap: "16px",
        }}
      >
        {/* Left Column: Brand and Contact */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Brand Logo & Name */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/images/logo.png" alt="Ai Cave Logo" style={{ height: "32px", width: "auto" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h3 style={{ color: "#ffffff", fontSize: "16px", fontWeight: 600, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              OSD OFFICE
            </h3>
            <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.6, margin: 0, maxWidth: "320px" }}>
              24 Soi Ramintra 20, Ramintra Road Tharang Subdistrict,<br />
              Bangkhen District Bangkok 10230, Thailand
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <a href="tel:+6620801111" style={{ color: "#cbd5e1", fontSize: "14px", textDecoration: "none" }}>+66 2 080 1111</a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <a href="mailto:AiCave@osd.co.th" style={{ color: "#cbd5e1", fontSize: "14px", textDecoration: "none" }}>AiCave@osd.co.th</a>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: PAGES */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h3 style={{ color: "#ffffff", fontSize: "16px", fontWeight: 600, margin: 0, letterSpacing: "0.02em" }}>
            PAGES
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            <li>
              <a href="#" style={{ color: "#cbd5e1", fontSize: "14px", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#ffffff"} onMouseOut={(e) => e.currentTarget.style.color = "#cbd5e1"}>
                Home
              </a>
            </li>
            <li>
              <a href="#" style={{ color: "#cbd5e1", fontSize: "14px", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#ffffff"} onMouseOut={(e) => e.currentTarget.style.color = "#cbd5e1"}>
                Features
              </a>
            </li>
            <li>
              <a href="#" style={{ color: "#cbd5e1", fontSize: "14px", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#ffffff"} onMouseOut={(e) => e.currentTarget.style.color = "#cbd5e1"}>
                Contact Sales
              </a>
            </li>
          </ul>
        </div>

        {/* Right Column: SOCIALS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h3 style={{ color: "#ffffff", fontSize: "16px", fontWeight: 600, margin: 0, letterSpacing: "0.02em" }}>
            SOCIALS
          </h3>
          <div style={{ display: "flex", gap: "16px" }}>
            {/* Facebook */}
            <a href="#" style={{ color: "#cbd5e1", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#ffffff"} onMouseOut={(e) => e.currentTarget.style.color = "#cbd5e1"}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" style={{ color: "#cbd5e1", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#ffffff"} onMouseOut={(e) => e.currentTarget.style.color = "#cbd5e1"}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            {/* Twitter */}
            <a href="#" style={{ color: "#cbd5e1", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#ffffff"} onMouseOut={(e) => e.currentTarget.style.color = "#cbd5e1"}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </a>
          </div>
          <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.6, margin: 0, maxWidth: "250px" }}>
            Copyright © My Company. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
