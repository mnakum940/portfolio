"use client";

import { useEffect, useState } from "react";
import { fetchCloudData } from "../utils/db";
import { motion } from "framer-motion";
import BootSequence from "./BootSequence";
import BgCanvas from "./BgCanvas";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Marquee from "./Marquee";
import About from "./About";
import Projects from "./Projects";
import Experience from "./Experience";
import Research from "./Research";
import Publications from "./Publications";
import Contact from "./Contact";
import Footer from "./Footer";
import CustomCursor from "./CustomCursor";
import Testimonials from "./Testimonials";
import NyraCompanion from "./NyraCompanion";

export default function HomeClient() {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    fetchCloudData();
  }, []);

  return (
    <>
      {/* Boot Sequence Overlay */}
      {!booted && <BootSequence onComplete={() => setBooted(true)} />}

      {/* Portfolio (mounts and fades in only after boot completes) */}
      {booted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative min-h-screen w-full bg-[#07090D] text-on-surface overflow-x-hidden selection:bg-primary/30 selection:text-white"
        >
        {/* Custom Cursor */}
        <CustomCursor />

        {/* Spatial AI Companion */}
        <NyraCompanion />

        {/* WebGL Background Canvas */}
        <BgCanvas />

        {/* CSS Overlays for grid and glow */}
        <div className="fixed inset-0 grid-pattern pointer-events-none z-0 opacity-40" />
        <div className="fixed inset-0 hero-glow pointer-events-none z-0" />

        {/* Navigation */}
        <Navbar />

        {/* Page Sections */}
        <Hero />
        <Marquee />
        <About />
        <Projects />
        <Experience />
        <Research />
        <Publications />
        <Testimonials />
        <Contact />

        {/* Footer */}
        <Footer />
        </motion.div>
      )}
    </>
  );
}
