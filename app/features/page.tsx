"use client";
import Navbar from "../home/components/Navbar";
import Footer from "../home/components/Footer";
import FeaturesHero from "./components/FeaturesHero";
import InfiniteAesthetics from "./components/InfiniteAesthetics";
import ImageGrid from "./components/ImageGrid";
import StunningGeneration from "./components/StunningGeneration";
import AIPowered from "./components/AIPowered";
import BuiltForCreators from "./components/BuiltForCreators";
import PremiumServices from "./components/PremiumServices";
import PlatformManagement from "./components/PlatformManagement";
import MediaLibrary from "./components/MediaLibrary";
import UsedByStyles from "./components/UsedByStyles";
import FeaturesCTA from "./components/FeaturesCTA";

export default function FeaturesPage() {
    return (
        <main style={{ minHeight: "100vh", backgroundColor: "#020308", color: "#ffffff", overflowX: "hidden", position: "relative" }}>
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
                <FeaturesHero />
                <InfiniteAesthetics />
                <ImageGrid />
                <StunningGeneration />
                <AIPowered />
                <BuiltForCreators />
                <PremiumServices />
                <PlatformManagement />
                <MediaLibrary />
                <UsedByStyles />
                <FeaturesCTA />
                <Footer />
            </div>
        </main>
    );
}
