"use client";
import { useLayoutEffect } from "react";
import Navbar from "../home/components/Navbar";
import LandingShell from "../home/components/LandingShell";
import AnnouncementModal from "../home/components/AnnouncementModal";
import Footer from "../home/components/Footer";
import FeaturesView from "./components/FeaturesView";
import { useLandingMeta } from "../home/i18n/useLandingMeta";

function FeaturesContent() {
  useLandingMeta("features");
  return <FeaturesView />;
}

export default function FeaturesPage() {
  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // A link like /features#community must land on that section, not be reset to the top.
    const hashTarget = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
    const scrollToTop = () => (hashTarget ? hashTarget.scrollIntoView() : window.scrollTo({ top: 0, left: 0, behavior: "auto" }));

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

  return (
    <LandingShell>
      <div className="relative z-10 flex flex-col">
        <Navbar />
        <AnnouncementModal />
        <FeaturesContent />
        <Footer />
      </div>
    </LandingShell>
  );
}
