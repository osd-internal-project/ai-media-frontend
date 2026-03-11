"use client";

import React, { useState, useEffect } from "react";

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    title: "Team Workspace",
    list: [
      "Unlimited workspaces",
      "Shared prompt libraries",
      "Controlled collaboration",
    ],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
        <line x1="9" y1="9" x2="9.01" y2="9"></line>
        <line x1="15" y1="9" x2="15.01" y2="9"></line>
        {/* Added a palette-like brush stroke or dot to simulate branding */}
        <circle cx="6" cy="12" r="1" fill="currentColor"></circle>
        <circle cx="18" cy="12" r="1" fill="currentColor"></circle>
      </svg>
    ),
    title: "Branding Control",
    list: [
      "Brand-aligned Prompt Framework",
      "Locked campaign templates",
      "Custom prompts designed by our AI specialists",
    ],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    ),
    title: "User & Token Management",
    list: [
      "Role-based access control",
      "Token limits per team or project",
      "Full usage tracking & ownership",
    ],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    ),
    title: "Data Security & Compliance",
    list: [
      "Data isolation per organization",
      "Activity logging & audit trails",
      "Enterprise-ready deployment options",
    ],
  },
];

export default function EnterpriseTeams() {
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMd = windowWidth >= 768;

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        paddingTop: "96px",
        paddingBottom: "96px",
        paddingLeft: "16px",
        paddingRight: "16px",
        background: "linear-gradient(to bottom, #080a0f 0%, #0a0c10 40%, #05070a 100%)", // Matches the deep dark tone
        overflow: "hidden",
      }}
    >
      {/* Background Watermark Text - Built for Enterprise Teams */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: 0,
          right: 0,
          pointerEvents: "none",
          zIndex: 0,
          display: "flex",
          flexDirection: "column",
          lineHeight: 0.85,
          paddingLeft: isMd ? "40px" : "16px",
          width: "200%", // Stretch off-screen
        }}
      >
        <span
          style={{
            fontSize: isMd ? "160px" : "80px",
            fontWeight: 800,
            color: "rgba(255, 255, 255, 0.02)",
            letterSpacing: "-0.04em",
          }}
        >
          Built for Enterprise
        </span>
        <span
          style={{
            fontSize: isMd ? "160px" : "80px",
            fontWeight: 800,
            color: "rgba(255, 255, 255, 0.02)",
            letterSpacing: "-0.04em",
          }}
        >
          Teams
        </span>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1200px",
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "64px",
        }}
      >
        {/* Header Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h2
            style={{
              fontSize: isMd ? "40px" : "30px",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: 0,
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: "#ffffff" }}>Built for Enterprise</span>
            <span
              style={{
                background: "linear-gradient(90deg, #7a73ff 0%, #7cd4d8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Teams
            </span>
          </h2>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "15px",
              lineHeight: 1.6,
              fontWeight: 400,
              margin: 0,
              maxWidth: "600px",
            }}
          >
            AI Cave isn't just a generator. It's a governed creative infrastructure.
          </p>
        </div>

        {/* 2x2 Feature Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMd ? "repeat(2, 1fr)" : "1fr",
            gap: "24px",
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "16px",
                padding: "32px",
                display: "flex",
                flexDirection: isMd ? "row" : "column",
                gap: "24px",
                alignItems: "flex-start",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              }}
            >
              {/* Icon Container */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                {feature.icon}
              </div>

              {/* Text Content */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3
                  style={{
                    color: "#ffffff",
                    fontSize: "20px",
                    fontWeight: 600,
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {feature.title}
                </h3>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {feature.list.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          background: "#94a3b8",
                          marginTop: "8px",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          color: "#cbd5e1",
                          fontSize: "14px",
                          lineHeight: 1.5,
                        }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
