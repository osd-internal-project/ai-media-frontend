"use client";
import Navbar from "./components/Navbar";
import LandingShell from "./components/LandingShell";
import LandingHero from "./components/LandingHero";
import HomeBands from "./components/HomeBands";
import AnnouncementModal from "./components/AnnouncementModal";
import Footer from "./components/Footer";
import { useLandingMeta } from "./i18n/useLandingMeta";

function HomeContent() {
  useLandingMeta("home");
  return (
    <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column" }}>
      <Navbar />
      <AnnouncementModal />
      <LandingHero />
      <HomeBands />
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <LandingShell>
      <HomeContent />
    </LandingShell>
  );
}
