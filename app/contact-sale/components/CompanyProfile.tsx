"use client";

import React, { useState, useEffect, useRef } from "react";
import { Row, Col } from "antd";
import { EnvironmentFilled, PhoneFilled, MailFilled, InstagramOutlined, TwitterOutlined, XOutlined } from "@ant-design/icons";
const tabs = [
  "4K Image Generation",
  "Multi-shot AI Video Creation",
  "Brand-Controlled Prompts",
  "Brand-Controlled Prompts", // duplicated in mockup
  "Enterprise-Grade",
];

export default function CompanyProfile() {
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const isMd = windowWidth >= 768;

  return (
    <div
      ref={sectionRef as React.RefObject<HTMLDivElement>}
      style={{
        position: "relative",
        width: "100%",
        paddingTop: "10px",
        paddingBottom: "62px",
        paddingLeft: "16px",
        paddingRight: "16px",
        background:
          "linear-gradient(to bottom, #080c17 40%, rgba(31, 27, 62, 0.4) 100%)", // Blend into next section
        overflow: "hidden",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 0.9s ease, transform 0.9s ease",
      }}
    >
      {/* Background radial gradient glow */}
      <div
        style={{
          position: "absolute",
          top: "90%",
          left: "0%",
          transform: "translate(-50%, -50%)",
          width: "900px",
          height: "400px",
          borderRadius: "30%",
          background: `
      radial-gradient(circle at 40% 50%, rgba(120,110,255,0.45) 0%, rgba(120,110,255,0.25) 30%, rgba(120,110,255,0.1) 55%, rgba(0,0,0,0) 70%),
      radial-gradient(circle at 70% 50%, rgba(120,180,255,0.35) 0%, rgba(120,180,255,0.15) 35%, rgba(0,0,0,0) 65%)
    `,
          filter: "blur(80px)",
          opacity: 0.9,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Galaxy Plan */}
      <Row className=" sm:mx-10 md:mx-12 pb-12">
        {/* Left Column: Details */}
        <Col xs={24} md={12} >
          <div className="flex flex-col justify-center h-full text-white px-2 md:px-6">
            
            {/* <div className="mb-10 text-[18px]">
              <span className="text-white font-medium">Message us on visit </span>
              <a href="https://aicave.ai/demo" className="text-[#6966FF] hover:text-[#5A55CC] transition-colors font-medium">
                aicave.ai/demo
              </a>
            </div> */}

            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="mt-1 shrink-0">
                  <EnvironmentFilled className="text-white text-xl" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-[17px] mb-2 leading-snug tracking-wide">OSD Office</h4>
                  <p className="text-[#D1D5DB] text-[15px] leading-relaxed font-light tracking-wide">
                    24 Soi Ramintra 20, Ramintra Road Tharang<br />
                    Subdistrict, Bangkhen District Bangkok<br />
                    10230, Thailand
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4 pt-2">
                <div className="shrink-0">
                  <PhoneFilled className="text-white text-xl" />
                </div>
                <p className="text-[#D1D5DB] text-[15px] font-light tracking-wide">+66 2 080 1111</p>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4 pt-2">
                <div className="shrink-0">
                  <MailFilled className="text-white text-xl" />
                </div>
                <p className="text-[#D1D5DB] text-[15px] font-light tracking-wide">osd_support@osd.co.th</p>
              </div>
            </div>

            {/* Socials */}
            <div className="mt-12">
              <h4 className="text-[#D1D5DB] uppercase text-[15px] font-normal tracking-[0.05em] mb-4">SOCIALS</h4>
              <div className="flex items-center gap-5">
                <a href="https://www.facebook.com/osdcompany/?locale=th_TH" className="flex justify-center items-center text-white hover:text-gray-300 transition-colors w-6 h-6">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-0.326-0.043-1.557-0.14-2.857-0.14-2.895 0-4.83 1.76-4.83 5.093V9.5H7.5v4h2.313V22h4.187V13.5z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/osd_company_limited?igsh=MXFuYngxNWVzcHI%3D&utm_source=qr" className="flex justify-center items-center text-white hover:text-gray-300 transition-colors w-6 h-6">
                  <InstagramOutlined className="text-xl" />
                </a>
                <a href="https://x.com/Osd_Company" className="flex justify-center items-center text-white hover:text-gray-300 transition-colors w-6 h-6">
                  <XOutlined className="text-xl" />
                </a>
              </div>
            </div>

          </div>
        </Col>

        {/* Right Column: Google Map */}
        <Col xs={24} md={12} >
          <div className="sm:mt-10 h-[450px] w-full rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-2xl relative bg-[#13121d]">
            <iframe
             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3873.7883645878596!2d100.63127398469915!3d13.851738542079458!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d62a495e8f70f%3A0xcda3166f23d15fd!2sO%20S%20D!5e0!3m2!1sen!2sth!4v1755662163882!5m2!1sen!2sth"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(85%) contrast(110%)" }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </Col>
      </Row>
    </div>
  );
}
