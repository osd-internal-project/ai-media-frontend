import React from "react";
const FuturisticBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 z-0 bg-black 
                 overflow-hidden // ซ่อนส่วนเกินของแอนิเมชัน
                 after:content-[''] after:absolute after:inset-0 
                 after:bg-[url('/path-to-your-grid-pattern.svg')] // รูปแบบ Grid
                 after:bg-repeat after:opacity-[0.03] // Grid จางๆ
                 after:pointer-events-none // ทำให้ Grid คลิกไม่ติด
                "
      style={{
        // Gradient สีดำ-ม่วง ที่เคลื่อนไหว
        // bg-[length:400%_400%] animate-dark-gradient
        backgroundImage: "linear-gradient(-45deg, #0a0a0a 0%, #1a0f1e 25%, #0a0a0a 50%, #1a0f1e 75%, #0a0a0a 100%)",
        backgroundSize: "400% 400%", // ทำให้ Gradient กว้างพอที่จะเลื่อนได้
        animation: "dark-gradient-shift 20s ease infinite", // ใช้ keyframe ที่กำหนด
      }}>
      {/* สามารถเพิ่ม effect อื่นๆ เช่น noise overlay ได้ที่นี่ */}
    </div>
  );
};

export default FuturisticBackground;
