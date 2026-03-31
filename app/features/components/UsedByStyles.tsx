"use client";

import React from "react";

export default function UsedByStyles() {
    const styles = [
        { title: "Anime Style", img: "/images/herosection/2.png" },
        { title: "Cinematic Lighting", img: "/images/herosection/1.jpg" },
        { title: "Cyberpunk Concept", img: "/images/herosection/3.png" },
        { title: "Fantasy Art", img: "/images/herosection/4.png" },
        { title: "Studio Portrait", img: "/images/herosection/5.jpeg" },
        { title: "Watercolor", img: "/images/herosection/1.jpg" },
    ];

    return (
        <section className="w-full py-24 px-6 lg:px-[10%] flex flex-col items-center border-t border-white/5">
            <h2 className="text-3xl font-bold mb-4 text-white text-center">
                Ready-to-Use <span className="text-blue-400">Style Models</span>
            </h2>
            <p className="text-gray-400 mb-12 text-center max-w-2xl">
                Access hundreds of fine-tuned models designed for specific aesthetic outputs, ensuring you get the exact style you need from the first prompt.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full max-w-[1400px]">
                {styles.map((style, idx) => (
                    <div
                        key={idx}
                        className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
                    >
                        <img
                            src={style.img}
                            alt={style.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>

                        <div className="absolute bottom-4 left-4 right-4">
                            <h4 className="text-white font-medium text-sm md:text-base transform translate-y-2 group-hover:translate-y-0 transition-transform">{style.title}</h4>
                            <div className="h-0.5 w-8 bg-blue-500 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                        </div>

                        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
