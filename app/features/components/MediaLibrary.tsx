"use client";

import React from "react";

export default function MediaLibrary() {
    return (
        <section className="w-full py-20 px-6 lg:px-[10%] flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Left side Content */}
            <div className="flex-1 max-w-lg z-10 space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                    Streamlined <span className="text-blue-400">Media</span> <br /> Library
                </h2>
                <p className="text-gray-400 text-lg">
                    Keep your generated assets organized and instantly accessible.
                    Use smart filtering, bulk actions, and direct integrations to speed up your workflow.
                </p>

                <div className="flex flex-col gap-4 mt-8">
                    <div className="bg-[#1a1c2e] border border-white/5 p-6 rounded-2xl flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-1">Project Workspaces</h4>
                            <p className="text-sm text-gray-400">Organize generations into dedicated folders and projects.</p>
                        </div>
                    </div>

                    <div className="bg-[#1a1c2e] border border-white/5 p-6 rounded-2xl flex items-start gap-4 transform translate-x-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-1">Instant Exports</h4>
                            <p className="text-sm text-gray-400">Download in multiple formats or sync directly to your favorite tools.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side Image Grid (Library visualization) */}
            <div className="flex-1 relative w-full h-[450px]">
                <div className="absolute inset-0 bg-blue-600/5 blur-[100px] rounded-full"></div>

                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[85%] h-[80%] bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-md shadow-2xl flex flex-col gap-3 z-10">
                    <div className="flex justify-between items-center px-2 pb-2 border-b border-white/10">
                        <span className="text-sm font-medium text-white/80">All Assets</span>
                        <div className="flex gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/50"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500/50"></span>
                        </div>
                    </div>

                    {/* Grid display */}
                    <div className="flex-1 grid grid-cols-3 gap-2 overflow-hidden rounded-xl">
                        <div className="bg-white/5 rounded-lg overflow-hidden relative group">
                            <img src="/images/herosection/1.jpg" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="bg-white/5 rounded-lg overflow-hidden relative group">
                            <img src="/images/herosection/2.png" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="bg-white/5 rounded-lg overflow-hidden relative group">
                            <img src="/images/herosection/3.png" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="bg-white/5 rounded-lg overflow-hidden relative group">
                            <img src="/images/herosection/4.png" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="bg-white/5 rounded-lg overflow-hidden relative group col-span-2 row-span-2">
                            <img src="/images/herosection/5.jpeg" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="bg-white/5 rounded-lg overflow-hidden relative group hidden sm:block">
                            <div className="w-full h-full bg-indigo-500/10 flex items-center justify-center">
                                <span className="text-2xl text-indigo-400/50">+</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
