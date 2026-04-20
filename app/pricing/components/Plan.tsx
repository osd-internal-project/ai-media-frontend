"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Navbar from "./Navbar";
import PricingCards from "@/app/components/package/PricingCards";
import { useRouter } from "next/navigation";
import PlanServices from "@/app/services/plan.service";
import { TPlan, TPlanInterval } from "@/app/common/plan.type";
import { axiosCore } from "@/app/lib/axios/axios";
import { Segmented } from "antd";

export default function Plan() {
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
      { threshold: 0.1 },
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [plans, setPlans] = useState<TPlan[]>([]);
  const [interval, setInterval] = useState<TPlanInterval>("MONTH");
  const [loading, setLoading] = useState(true);

  const planService = useMemo(() => PlanServices(axiosCore), []);

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => {
      const priceA = a.prices?.[0]?.price || 0;
      const priceB = b.prices?.[0]?.price || 0;
      return priceA - priceB;
    });
  }, [plans]);

  const handleGetStarted = (priceId: string) => {
    router.push(`/login`);
  };

  const fetchPlans = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await planService.findAllFormatted();
      setPlans(data);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [planService]);

  useEffect(() => {
    setMounted(true);
    fetchPlans();
  }, [fetchPlans]);

  if (!mounted) return null;

  const isMd = windowWidth >= 768;
  const isLg = windowWidth >= 1024;

  return (
    <>
      <section
        ref={sectionRef}
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "112px",
          paddingBottom: "40px",
          paddingLeft: "16px",
          paddingRight: "16px",
          overflow: "hidden",
          backgroundColor: "#0a0a0f",
          backgroundImage: 'url("/images/herosection/bg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Navbar />
        {/* Background Collage representing Image 2 */}

        {/* Gradient overlays to match Hero image 1 dark fading */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 0,
            background:
              "linear-gradient(to bottom, rgba(10, 10, 15, 0.8), rgba(10, 10, 15, 0.6), rgba(10, 10, 15, 1))",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 0,
            background:
              "radial-gradient(circle at center, transparent 0%, #0a0a0f 90%)",
            pointerEvents: "none",
          }}
        />
        <div className="pt-20 pb-16 overflow-hidden z-10">
          <div className="container mx-auto px-4">
            <div className="text-left mb-16 text-white ">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Pricing Plans
              </h1>
              <p className="text-lg">
                Choose the perfect plan for you and your team.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6966FF] mx-auto"></div>
              </div>
            ) : (
              <div className=" flex flex-col justify-center items-center mt-0 mb-10">
                <div className="mb-4 text-center">
                  <Segmented
                    value={interval}
                    onChange={(value) => setInterval(value as TPlanInterval)}
                    options={[
                      {
                        label: (
                          <div style={{ padding: 4 }}>
                            <div>Monthly</div>
                          </div>
                        ),
                        value: "MONTH",
                      },
                      {
                        label: (
                          <div style={{ padding: 4 }}>
                            <div>Yearly (-3%)</div>
                          </div>
                        ),
                        value: "YEAR",
                      },
                    ]}
                  />
                </div>
                <PricingCards
                  plans={sortedPlans}
                  onGetStarted={handleGetStarted}
                  planInterval={interval}
                  generateManualPrice={false}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
