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

  useEffect(() => {
    const interval = setInterval(() => {
      // 🔥 เปลี่ยนจาก +1 เป็น -1
      setIndex((prev) => (prev - 1 + images.length) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const leftImage = images[(index + 1) % images.length];
  const rightImage = images[index];

  return (
    <div style={styles.wrapper}>
      <div style={styles.frame}>
        <div style={styles.container}>
          {/* LEFT CARD */}
          <div
            style={{
              ...styles.left,
              backgroundImage: `url(${leftImage})`,
            }}
          />

          {/* RIGHT CARD */}
          <div
            style={{
              ...styles.right,
              backgroundImage: `url(${rightImage})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  wrapper: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  frame: {
    padding: "20px",
    borderRadius: "40px",

   
  },

  container: {
    display: "flex",
    perspective: "1000px",
  },

  left: {
    width: "400px",
    height: "440px",
    borderRadius: "16px",
    backgroundSize: "cover",
    backgroundPosition: "center",

    transform: "rotateY(-25deg)",
    transformOrigin: "left center",

    marginRight: "-40px",

    transition: "all 600ms ease",
    boxShadow: "0 10px 60px rgba(0,0,0,0.6)",
  },

  right: {
    width: "300px",
    height: "440px",
    borderRadius: "16px",
    backgroundSize: "cover",
    backgroundPosition: "center",

    transform: "rotateY(25deg)",
    transformOrigin: "right center",

    transition: "all 600ms ease",
    boxShadow: "0 10px 60px rgba(0,0,0,0.6)",
  },
};