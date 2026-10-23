"use client";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect, useLayoutEffect, useState } from "react";
import Navbar from "../home/components/Navbar";
import AnnouncementModal from "../home/components/AnnouncementModal";
import Footer from "../home/components/Footer";
import FeaturesHero from "./components/FeaturesHero";

function SectionFallback() {
  return <div className="min-h-[320px] w-full md:min-h-[420px]" aria-hidden="true" />;
}

const AiCaveIntro = dynamic(() => import("./components/AiCaveIntro"), {
  loading: () => <SectionFallback />,
});
const AiCaveMeaning = dynamic(() => import("./components/AiCaveMeaning"), {
  loading: () => <SectionFallback />,
});
const FeaturesCarousel = dynamic(() => import("./components/FeaturesCarousel"), {
  loading: () => <SectionFallback />,
});
const ImgVidGeneration = dynamic(() => import("./components/ImgVidGeneration"), {
  loading: () => <SectionFallback />,
});
const UltraRealistic = dynamic(() => import("./components/UltraRealistic"), {
  loading: () => <SectionFallback />,
});
const DynamicCharacter = dynamic(() => import("./components/DynamicCharacter"), {
  loading: () => <SectionFallback />,
});
const GuidedPrompt = dynamic(() => import("./components/GuidedPrompt"), {
  loading: () => <SectionFallback />,
});
const PromptStandardization = dynamic(() => import("./components/PromptStandardization"), {
  loading: () => <SectionFallback />,
});
const RoleAndToken = dynamic(() => import("./components/RoleAndToken"), {
  loading: () => <SectionFallback />,
});
const TeamCollaboration = dynamic(() => import("./components/TeamCollaboration"), {
  loading: () => <SectionFallback />,
});
const SecureCloud = dynamic(() => import("./components/SecureCloud"), {
  loading: () => <SectionFallback />,
});
const Benefits = dynamic(() => import("./components/Benefits"), {
  loading: () => <SectionFallback />,
});
const FeaturesCTA = dynamic(() => import("./components/FeaturesCTA"), {
  loading: () => <SectionFallback />,
});

export default function FeaturesPage() {
    const [bgLoaded, setBgLoaded] = useState(false);

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    scrollToTop();

    const animationFrameId = window.requestAnimationFrame(scrollToTop);
    const timeoutId = window.setTimeout(scrollToTop, 0);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(timeoutId);

      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = previousScrollRestoration;
      }
    };
  }, []);

    useEffect(() => {
        const img = new window.Image();
        img.src = "/images/feature-page/feature-bg.webp";
        img.onload = () => setBgLoaded(true);
    }, []);

    return (
        <>
            <Head>
                <link rel="preload" as="image" href="/images/feature-page/feature-bg.webp" />
            </Head>
            <main
                style={{
                    minHeight: "100vh",
                    color: "#ffffff",
                    overflowX: "hidden",
                    position: "relative",
                    backgroundImage: bgLoaded ? "url('/images/feature-page/feature-bg.webp')" : "none",
                    backgroundColor: "#181c3c",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    transition: "background-image 0.3s ease",
                }}
            >
            {/* Ambient Background Glows */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                    pointerEvents: "none",
                    overflow: "hidden",
                }}
            >
                {/* Deep blue/purple center glow */}
                <div style={{
                    position: "absolute",
                    top: "40%",
                    left: "40%",
                    width: "120vw",
                    height: "120vh",
                    transform: "translate(-50%, -50%)",
                    background: "radial-gradient(circle, rgba(20, 24, 60, 0.4) 0%, rgba(2, 3, 8, 0) 60%)",
                    filter: "blur(100px)",
                }} />

                {/* Soft lighter blue right edge glow */}
                <div style={{
                    position: "absolute",
                    top: "50%",
                    right: "-30%",
                    width: "80vw",
                    height: "100vh",
                    transform: "translateY(-50%)",
                    background: "radial-gradient(circle, rgba(30, 45, 80, 0.25) 0%, rgba(2, 3, 8, 0) 60%)",
                    filter: "blur(120px)",
                }} />
            </div>

            {/* Content wrapper with z-index to sit above the fixed background */}
              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column" }}>
                <Navbar />
                <AnnouncementModal />
                <FeaturesHero />
                <AiCaveIntro />
                <AiCaveMeaning />
                <FeaturesCarousel />
                <ImgVidGeneration />
                <UltraRealistic />
                <DynamicCharacter />
                <GuidedPrompt />
                <PromptStandardization />
                <RoleAndToken />
                <TeamCollaboration />
                <SecureCloud />
                <Benefits />
                <FeaturesCTA />
                <Footer />
              </div>
            </main>
          </>
    );
}
