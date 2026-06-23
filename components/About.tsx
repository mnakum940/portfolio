"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getStoredSettings, DEFAULT_SETTINGS, ProfileSettings } from "../utils/db";

export default function About() {
  const [settings, setSettings] = useState<ProfileSettings>(DEFAULT_SETTINGS);

  const [isSpotlit, setIsSpotlit] = useState(false);

  useEffect(() => {
    setSettings(getStoredSettings());

    const handleSync = () => {
      setSettings(getStoredSettings());
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("settings_updated", handleSync);

    const handleSpotlight = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.id === "about") {
        setIsSpotlit(true);
        setTimeout(() => setIsSpotlit(false), 3000);
      }
    };
    window.addEventListener("spotlight_section", handleSpotlight);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("settings_updated", handleSync);
      window.removeEventListener("spotlight_section", handleSpotlight);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <section
      className={`py-[60px] lg:py-[120px] px-margin-mobile lg:px-margin-desktop w-full max-w-container-max mx-auto overflow-hidden transition-all duration-700 rounded-3xl ${
        isSpotlit ? "ring-2 ring-primary/60 bg-primary/5 shadow-[0_0_50px_rgba(163,201,255,0.3)] scale-[1.01]" : ""
      }`}
      id="about"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center"
      >
        {/* Left Side: Animated Terminal Icon Card (Hidden on mobile to save space) */}
        <motion.div
          variants={cardVariants}
          className="glass-card aspect-square rounded-[30px] lg:rounded-[40px] overflow-hidden relative group max-h-[320px] md:max-h-none mx-auto w-full max-w-[320px] md:max-w-none hidden lg:block"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <img
            src="/about_meet_nakum.png"
            alt="About image"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Right Side: Text & Stats */}
        <div className="space-y-6 lg:space-y-8">
          <motion.span
            variants={itemVariants}
            className="text-[10px] lg:text-[12px] tracking-[0.1em] font-semibold text-primary uppercase"
          >
            ABOUT THE ENGINEER
          </motion.span>
          
          <motion.h2
            variants={itemVariants}
            className="font-display text-[28px] md:text-[48px] font-semibold leading-[1.2] letter-spacing-[-0.02em]"
          >
            {settings.aboutTitle}
          </motion.h2>
          
          <motion.p
            variants={itemVariants}
            className="font-body text-[15px] md:text-[18px] text-on-surface-variant leading-[1.6]"
          >
            {settings.aboutBio}
          </motion.p>

          <div className="grid grid-cols-2 gap-4 lg:gap-6 pt-4">
            <motion.div
              variants={itemVariants}
              className="glass-card p-4 lg:p-6 rounded-xl lg:rounded-2xl"
            >
              <h4 className="text-primary font-bold text-xl lg:text-2xl mb-1 lg:mb-2">{settings.stat1Value}</h4>
              <p className="text-[10px] lg:text-[12px] tracking-[0.1em] font-semibold text-on-surface-variant uppercase">
                {settings.stat1Label}
              </p>
            </motion.div>
            
            <motion.div
              variants={itemVariants}
              className="glass-card p-4 lg:p-6 rounded-xl lg:rounded-2xl"
            >
              <h4 className="text-primary font-bold text-xl lg:text-2xl mb-1 lg:mb-2">{settings.stat2Value}</h4>
              <p className="text-[10px] lg:text-[12px] tracking-[0.1em] font-semibold text-on-surface-variant uppercase">
                {settings.stat2Label}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
