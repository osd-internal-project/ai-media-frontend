"use client";

import React, { useEffect, useState } from "react";

const images = [
  "/images/generate-smarter/1.png",
  "/images/generate-smarter/2.jpeg",
  "/images/generate-smarter/3.jpeg",
  "/images/generate-smarter/4.jpeg",
];

export default function TwoCardCarousel() {
  const [index, setIndex] = useState(0);
  const leftImage = images[(index + 1) % images.length];
  const rightImage = images[index];

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // 🔥 เปลี่ยนจาก +1 เป็น -1
  //     setIndex((prev) => (prev - 1 + images.length) % images.length);
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, []);


  useEffect(() => {
  const img1 = new window.Image();
  const img2 = new window.Image();

  img1.src = leftImage;
  img2.src = rightImage;

  Promise.all([
    new Promise((res) => (img1.onload = res)),
    new Promise((res) => (img2.onload = res)),
  ]);
  }, [leftImage, rightImage]);

  return (
<div className="w-full flex items-center justify-center">
  <div className="p-2 md:p-5 rounded-[40px]">
    <div
      className="flex items-center justify-center [perspective:900px] md:[perspective:1000px]"
    >
      {/* LEFT CARD */}
      <div
        className={`
          flex
          w-[100px] h-[120px]
          md:w-[300px] md:h-[360px]
          lg:w-[400px] lg:h-[440px]
          rounded-xl overflow-hidden
          mr-[-32px] md:mr-[-40px]
          bg-black shadow-lg
          items-center justify-center
        `}
        style={{
          transform: "rotateY(-25deg)",
          transformOrigin: "left center",
          transition: "all 600ms ease",
        }}
      >
        <video
          src="/images/feature-page/img-vid-gen/video1.webm"
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
      {/* RIGHT CARD */}
      <div
        className={`
          flex
          w-[80px] h-[120px]
          md:w-[220px] md:h-[360px]
          lg:w-[300px] lg:h-[440px]
          rounded-xl overflow-hidden
          bg-black shadow-lg
          items-center justify-center
        `}
        style={{
          transform: "rotateY(25deg)",
          transformOrigin: "right center",
          transition: "all 600ms ease",
        }}
      >
        <video
          src="/images/feature-page/img-vid-gen/video1.webm"
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
    </div>
  </div>
</div>
  );
}
