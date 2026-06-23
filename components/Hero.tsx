"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import HeroThree from "./HeroThree";
import { getStoredSettings, DEFAULT_SETTINGS, ProfileSettings } from "../utils/db";

export default function Hero() {
  const containerRef = useRef<HTMLElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [settings, setSettings] = useState<ProfileSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(getStoredSettings());

    const handleSync = () => {
      setSettings(getStoredSettings());
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("settings_updated", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("settings_updated", handleSync);
    };
  }, []);

  // Scroll parallax for the portrait container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  
  // Maps scroll progress to vertical translation (speed -0.05 approx)
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -80]);

  // Mouse move effect for the hero image
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const moveX = (e.clientX - window.innerWidth / 2) * 0.015;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.015;
      setMousePos({ x: moveX, y: moveY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Framer Motion staggered animations configuration
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
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

  const nameParts = settings.name.split(" ");
  const firstName = nameParts[0] || "MEET";
  const lastName = nameParts.slice(1).join(" ") || "NAKUM";

  return (
    <section
      ref={containerRef}
      className="relative min-h-[70vh] lg:min-h-screen flex items-center pt-[88px] lg:pt-[72px] pb-12 lg:pb-0 px-margin-mobile lg:px-margin-desktop w-full max-w-container-max mx-auto overflow-hidden"
    >
      {/* Mobile background portrait overlay to save space and reduce scroll */}
      <div className="absolute inset-0 block lg:hidden z-0 overflow-hidden">
        <motion.img
          alt={settings.name}
          className="w-full h-full object-cover opacity-[0.08] grayscale meet-portrait"
          src={settings.portraitUrl || "/meet_nakum.jpg"}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090D] via-[#07090D]/50 to-[#07090D]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 w-full items-center relative z-10 py-8 lg:py-12"
      >
        {/* Left Side: Staggered Content */}
        <div className="space-y-6 lg:space-y-8">
          <div className="flex flex-wrap gap-1.5 lg:gap-2">
            <motion.span
              variants={itemVariants}
              className="px-3 py-1 glass-card rounded-full text-[10px] md:text-[12px] tracking-[0.1em] font-semibold text-primary border border-primary/20"
            >
              {settings.role.toUpperCase()}
            </motion.span>
            <motion.span
              variants={itemVariants}
              className="px-3 py-1 glass-card rounded-full text-[10px] md:text-[12px] tracking-[0.1em] font-semibold text-on-surface-variant"
            >
              {settings.subtitle.toUpperCase()}
            </motion.span>
          </div>
          
          <motion.h1
            variants={itemVariants}
            className="font-display text-[36px] sm:text-[48px] md:text-[72px] font-bold leading-[1.1] letter-spacing-[-0.04em]"
          >
            {firstName.toUpperCase()} <span className="text-primary">{lastName.toUpperCase()}</span>
          </motion.h1>
          
          <motion.p
            variants={itemVariants}
            className="font-body text-[16px] md:text-[18px] text-on-surface-variant max-w-xl leading-[1.6] letter-spacing-[-0.01em]"
          >
            {settings.heroBio}
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-wrap gap-3 lg:gap-4">
            <a
              className="bg-primary text-on-primary px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-bold flex items-center gap-2 hover:shadow-[0_0_25px_rgba(163,201,255,0.4)] transition-all group"
              href="#projects"
            >
              View Projects
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </a>
            <a
              className="px-6 py-3 lg:px-8 lg:py-4 glass-card rounded-xl font-bold flex items-center gap-2 hover:bg-white/5 transition-all"
              href="#contact"
            >
              Contact Me
            </a>
          </motion.div>
        </div>

        {/* Right Side: Portrait & 3D Icosahedron Scene (Hidden on mobile to save space) */}
        <div className="relative justify-self-center lg:justify-self-end mt-10 lg:mt-0 hidden lg:block">
          <HeroThree />

          <motion.div
            style={{ y: yParallax }}
            className="relative w-[280px] h-[370px] sm:w-[320px] sm:h-[420px] md:w-[420px] md:h-[560px] rounded-3xl overflow-hidden glass-card p-2 group z-10 shadow-2xl"
          >
            <motion.img
              ref={imageRef}
              animate={{
                x: mousePos.x,
                y: mousePos.y,
              }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
              alt={settings.name}
              className="w-full h-full object-cover rounded-2xl meet-portrait scale-110 transition-all duration-700"
              src={settings.portraitUrl || "/meet_nakum.jpg"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090D]/80 to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
