"use client";

import React from "react";

export default function PremiumServices() {
    const images = [
        "/images/herosection/1.jpg",
        "/images/herosection/2.png",
        "/images/herosection/3.png",
        "/images/herosection/4.png",
        "/images/herosection/5.jpeg"
    ];

    return (
        <section className="w-full py-24 px-6 flex flex-col items-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-white text-center">
                Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Director Services</span>
            </h2>

            <div className="w-full max-w-[1400px] overflow-hidden">
                <div className="flex gap-4 md:gap-6 justify-center">
                    {images.map((img, idx) => (
                        <div
                            key={idx}
                            className={`relative rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] cursor-pointer
                    ${idx === 2 ? 'w-1/3 md:w-1/4 h-[300px] shadow-[0_0_30px_rgba(30,58,138,0.4)] z-10 scale-105' : 'w-1/4 md:w-1/6 h-[240px] opacity-70 hover:opacity-100'}
                 `}
                            style={{ marginTop: idx === 2 ? '0' : '30px' }}
                        >
                            <img src={img} alt={`Premium Service ${idx}`} className="w-full h-full object-cover" />
                            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent ${idx === 2 ? 'opacity-50' : 'opacity-80'}`}></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
