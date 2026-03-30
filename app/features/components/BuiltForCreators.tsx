"use client";

import React from "react";

export default function BuiltForCreators() {
    const features = [
        {
            id: "01",
            title: "Built for Creators",
            description: "Designed with professional workflows in mind. Integrate seamlessly with your existing tools.",
            isActive: false
        },
        {
            id: "02",
            title: "Team Collaboration",
            description: "Share assets, ideas, and prompts across your team instantly with real-time syncing.",
            isActive: true
        },
        {
            id: "03",
            title: "Commercial Rights",
            description: "Full ownership of everything you generate. Use your assets anywhere without worrying about licensing.",
            isActive: false
        }
    ];

    return (
        <section className="w-full py-20 px-6 lg:px-[10%] flex flex-col items-center relative">
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {features.map((feature, idx) => (
                    <div
                        key={idx}
                        className={`p-8 rounded-3xl backdrop-blur-md transition-all duration-300 transform hover:-translate-y-2
              ${feature.isActive
                                ? 'bg-gradient-to-br from-indigo-600 to-purple-700 shadow-[0_20px_40px_rgba(99,102,241,0.4)] border border-indigo-400/50 scale-105 z-10'
                                : 'bg-[#1a1c2e] border border-white/5 shadow-xl hover:bg-[#202236]'
                            }
            `}
                    >
                        <div className={`text-5xl font-bold mb-6 opacity-20 ${feature.isActive ? 'text-white' : 'text-indigo-400'}`}>
                            {feature.id}
                        </div>
                        <h3 className={`text-2xl font-semibold mb-4 ${feature.isActive ? 'text-white' : 'text-gray-100'}`}>
                            {feature.title}
                        </h3>
                        <p className={`line-clamp-4 ${feature.isActive ? 'text-indigo-100' : 'text-gray-400'}`}>
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* Background elements */}
            <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden flex items-center justify-center">
                <div className="w-[800px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full"></div>
            </div>
        </section>
    );
}
