"use client";

import React from "react";

export default function PlatformManagement() {
    return (
        <section className="w-full py-20 px-6 xl:px-[10%] flex justify-center">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 bg-[#080b14] border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl overflow-hidden relative">

                {/* Abstract Background for card */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Left Side: Images */}
                <div className="relative h-[400px] w-full flex items-center justify-center">
                    <div className="flex w-full h-full gap-4">
                        <div className="w-1/3 h-[90%] mt-auto rounded-3xl overflow-hidden border border-white/10 shadow-lg translate-y-4">
                            <img src="/images/herosection/1.jpg" alt="Platform Image 1" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-1/3 h-[100%] rounded-3xl overflow-hidden border border-white/10 shadow-xl z-10 scale-105">
                            <img src="/images/herosection/4.png" alt="Platform Image 2" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-1/3 h-[80%] mb-auto rounded-3xl overflow-hidden border border-white/10 shadow-lg -translate-y-4">
                            <img src="/images/herosection/2.png" alt="Platform Image 3" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>

                {/* Right Side: Content */}
                <div className="flex flex-col justify-center space-y-8 z-10 pt-8 lg:pt-0">

                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold tracking-wider text-blue-400 uppercase">Modern Platform</h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                            Management
                        </h3>
                        <p className="text-gray-400 font-light">
                            Our enterprise-grade platform is built to handle complex workflows and large teams.
                            Manage permissions, monitor usage, and organize assets securely in one place.
                        </p>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-white/10">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                                <span className="text-blue-400 font-bold">01</span>
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-1">Role-Based Access Control</h4>
                                <p className="text-sm text-gray-500">Assign specific permissions to team members to ensure security and proper workflow.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                                <span className="text-indigo-400 font-bold">02</span>
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-1">Advanced Analytics</h4>
                                <p className="text-sm text-gray-500">Track generation usage, model performance, and team productivity in real time.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
