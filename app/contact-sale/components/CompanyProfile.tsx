"use client";

import React, { useEffect, useRef, useState } from "react";
import { Row, Col } from "antd";
import {
  EnvironmentFilled,
  PhoneFilled,
  MailFilled,
  InstagramOutlined,
  XOutlined,
} from "@ant-design/icons";

export default function CompanyProfile() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowMap(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "300px 0px" },
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

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
        contentVisibility: "auto",
        containIntrinsicSize: "700px",
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
          filter: "blur(48px)",
          opacity: 0.55,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Galaxy Plan */}
      <Row className="mx-auto max-w-6xl pb-8 sm:px-4 md:px-6 lg:px-8">
        {/* Left Column: Details */}
        <Col xs={24} md={12}>
          <div className="flex h-full flex-col justify-center px-1 text-white sm:px-2 md:px-6">
            
            {/* <div className="mb-10 text-[18px]">
              <span className="text-white font-medium">Message us on visit </span>
              <a href="https://aicave.ai/demo" className="text-[#6966FF] hover:text-[#5A55CC] transition-colors font-medium">
                aicave.ai/demo
              </a>
            </div> */}

            <div className="space-y-5 sm:space-y-6">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="mt-1 shrink-0">
                  <EnvironmentFilled className="text-white text-xl" />
                </div>
                <div>
                  <h4 className="mb-2 text-[17px] font-semibold leading-snug tracking-wide text-white">OSD Office</h4>
                  <p className="text-sm font-light leading-relaxed tracking-wide text-[#D1D5DB] sm:text-[15px]">
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
                <p className="text-sm font-light tracking-wide text-[#D1D5DB] sm:text-[15px]">+66 2 080 1111</p>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4 pt-2">
                <div className="shrink-0">
                  <MailFilled className="text-white text-xl" />
                </div>
                <p className="break-all text-sm font-light tracking-wide text-[#D1D5DB] sm:text-[15px] sm:break-normal">osd_support@osd.co.th</p>
              </div>
            </div>

            {/* Socials */}
            <div className="mt-10 sm:mt-12">
              <h4 className="mb-4 text-[15px] font-normal uppercase tracking-[0.05em] text-[#D1D5DB]">SOCIALS</h4>
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
        <Col xs={24} md={12}>
          <div className="relative mt-10 h-[320px] w-full overflow-hidden rounded-[2rem] border-4 border-white/5 bg-[#13121d] shadow-2xl sm:h-[380px] sm:rounded-[2.25rem] md:h-[450px] md:rounded-[2.5rem]">
            {showMap ? (
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3873.7883645878596!2d100.63127398469915!3d13.851738542079458!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d62a495e8f70f%3A0xcda3166f23d15fd!2sO%20S%20D!5e0!3m2!1sen!2sth!4v1755662163882!5m2!1sen!2sth"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            ) : null}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,23,0.14),rgba(8,12,23,0.28))]"
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}
